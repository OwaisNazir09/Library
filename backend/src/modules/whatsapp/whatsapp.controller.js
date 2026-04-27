import WhatsAppService from '../../services/whatsapp.service.js';
import WhatsAppLog from './whatsapp.model.js';
import logger from '../../utils/logger.js';


export const initializeWhatsApp = async (req, res) => {
    try {
        const tenantId = req.tenantId || (req.user && req.user.tenantId);
        if (!tenantId) {
            return res.status(400).json({ success: false, message: 'Tenant identification failed' });
        }

        await WhatsAppService.getClient(tenantId);
        res.status(200).json({ success: true, message: 'WhatsApp initialization started' });
    } catch (error) {
        console.error('WhatsApp Init Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWhatsAppStatus = async (req, res) => {
    try {
        const tenantId = req.tenantId || (req.user && req.user.tenantId);
        const status = WhatsAppService.getQRStatus(tenantId);
        res.status(200).json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logoutWhatsApp = async (req, res) => {
    try {
        const tenantId = req.tenantId || (req.user && req.user.tenantId);
        const result = await WhatsAppService.logout(tenantId);
        res.status(200).json({ success: true, loggedOut: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWhatsAppLogs = async (req, res) => {
    try {
        const tenantId = req.tenantId || (req.user && req.user.tenantId);
        const logs = await WhatsAppLog.find({ tenantId }).sort({ timestamp: -1 }).limit(50);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

