import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import path from 'path';
import fs from 'fs';
import pino from 'pino';
import WhatsAppLog from '../modules/whatsapp/whatsapp.model.js';
import logger from '../utils/logger.js';

class WhatsAppService {
    constructor() {
        this.clients = new Map();
        this.qrCodes = new Map();
    }

    async logEvent(tenantId, event, message, metadata = {}) {
        const tId = tenantId.toString();
        try {
            await WhatsAppLog.create({
                tenantId: tId,
                event,
                message,
                metadata
            });
            logger.info(`[WA] ${event} for ${tId}: ${message}`);
        } catch (err) {
            logger.error(`[WA] Failed to log event for ${tId}:`, err);
        }
    }

    async getClient(tenantId) {
        const tId = tenantId.toString();
        if (this.clients.has(tId)) {
            return;
        }

        logger.info(`[WA] Starting Baileys initialization for tenant: ${tId}`);
        
        try {
            const authPath = path.resolve(`./.baileys_auth/${tId}`);
            if (!fs.existsSync(authPath)) {
                fs.mkdirSync(authPath, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(authPath);
            const { version } = await fetchLatestBaileysVersion();

            const sock = makeWASocket({
                version,
                printQRInTerminal: false,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
                },
                logger: pino({ level: 'silent' }),
                browser: ['Library System', 'Chrome', '1.0.0'],
                patchMessageBeforeSending: (message) => {
                    const requiresPatch = !!(
                        message.buttonsMessage ||
                        message.templateMessage ||
                        message.listMessage
                    );
                    if (requiresPatch) {
                        message = {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    ...message
                                }
                            }
                        };
                    }
                    return message;
                }
            });

            this.clients.set(tId, sock);

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    logger.info(`[WA] QR received for ${tId}`);
                    try {
                        const qrImage = await qrcode.toDataURL(qr);
                        this.qrCodes.set(tId, {
                            image: qrImage,
                            status: 'QR_RECEIVED',
                            timestamp: new Date()
                        });
                        await this.logEvent(tId, 'QR_GENERATED', 'Scan QR to connect');
                    } catch (err) {
                        logger.error(`[WA] QR Error for ${tId}:`, err);
                    }
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect.error instanceof Boom) 
                        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut 
                        : true;
                    
                    logger.info(`[WA] Connection closed for ${tId}. Reconnecting: ${shouldReconnect}`);
                    this.clients.delete(tId);
                    
                    if (shouldReconnect) {
                        this.getClient(tId);
                    } else {
                        this.qrCodes.set(tId, { status: 'DISCONNECTED', timestamp: new Date() });
                        await this.logEvent(tId, 'DISCONNECTED', 'Logged out');
                    }
                } else if (connection === 'open') {
                    logger.info(`[WA] Connection OPEN for ${tId}`);
                    this.qrCodes.set(tId, { status: 'READY', timestamp: new Date() });
                    await this.logEvent(tId, 'READY', 'WhatsApp connected');
                }
            });

        } catch (error) {
            logger.error(`[WA] Initialization failed for ${tId}:`, error);
            this.clients.delete(tId);
            throw error;
        }
    }

    getQRStatus(tenantId) {
        const tId = tenantId.toString();
        return this.qrCodes.get(tId) || { status: 'NOT_INITIALIZED' };
    }

    async logout(tenantId) {
        const tId = tenantId.toString();
        const sock = this.clients.get(tId);
        if (sock) {
            try {
                await sock.logout();
                await sock.end();
            } catch (err) {
                logger.error(`[WA] Logout error for ${tId}:`, err);
            }
            this.clients.delete(tId);
            this.qrCodes.delete(tId);
            
            // Clear auth folder
            const authPath = path.resolve(`./.baileys_auth/${tId}`);
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
            }

            await this.logEvent(tId, 'LOGOUT', 'User logged out');
            return true;
        }
        return false;
    }

    async sendMessage(tenantId, number, message) {
        const tId = tenantId.toString();
        const sock = this.clients.get(tId);
        
        if (!sock) {
            logger.error(`[WA] Cannot send message: Client not initialized for ${tId}`);
            return false;
        }

        const status = this.qrCodes.get(tId);
        if (!status || status.status !== 'READY') {
            logger.error(`[WA] Cannot send message: Client not ready for ${tId}`);
            return false;
        }

        try {
            let formattedNumber = number.replace(/\D/g, '');
            
            // Auto-fix for 10-digit numbers (assume India +91)
            if (formattedNumber.length === 10) {
                formattedNumber = '91' + formattedNumber;
            }

            if (!formattedNumber.endsWith('@s.whatsapp.net')) {
                formattedNumber = `${formattedNumber}@s.whatsapp.net`;
            }

            await sock.sendMessage(formattedNumber, { text: message });
            logger.info(`[WA] Message sent to ${formattedNumber} for ${tId}`);
            await this.logEvent(tId, 'MESSAGE_SENT', `To: ${formattedNumber}`);
            return true;
        } catch (err) {
            logger.error(`[WA] Send message error for ${tId}:`, err);
            return false;
        }
    }

    async sendDocument(tenantId, number, fileBuffer, fileName, caption = '') {
        const tId = tenantId.toString();
        const sock = this.clients.get(tId);
        
        if (!sock) return false;

        try {
            let formattedNumber = number.replace(/\D/g, '');
            if (formattedNumber.length === 10) formattedNumber = '91' + formattedNumber;
            if (!formattedNumber.endsWith('@s.whatsapp.net')) formattedNumber = `${formattedNumber}@s.whatsapp.net`;

            await sock.sendMessage(formattedNumber, { 
                document: fileBuffer, 
                mimetype: 'application/pdf',
                fileName: fileName,
                caption: caption
            });
            
            await this.logEvent(tId, 'DOCUMENT_SENT', `File: ${fileName} to ${formattedNumber}`);
            return true;
        } catch (err) {
            logger.error(`[WA] Send document error for ${tId}:`, err);
            return false;
        }
    }
}

export default new WhatsAppService();
