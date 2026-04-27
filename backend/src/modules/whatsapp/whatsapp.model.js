import mongoose from 'mongoose';

const whatsappLogSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        required: true,
        index: true
    },
    event: {
        type: String,
        required: true,
    },
    message: {
        type: String,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const WhatsAppLog = mongoose.model('WhatsAppLog', whatsappLogSchema);

export default WhatsAppLog;
