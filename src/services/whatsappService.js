import api from './api';

export const whatsappService = {
  // Send WhatsApp message
  sendMessage: (messageData) => {
    return api.post('/whatsapp/send', messageData);
  },
};