const sgMail = require('@sendgrid/mail');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

class EmailService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Configura a chave de API do SendGrid
    }

    // Função para enviar e-mail com o link de redefinição de senha
    async enviarEmail(email, token) {
        const link = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/confirmPass.html?email=${email}&token=${token}`;

        const msg = {
            to: email,
            from: 'luizgrenfer@gmail.com',  // Seu e-mail do qual o e-mail será enviado
            templateId: process.env.TEMPLATE_ID_RESET_EMAIL, // ID do template no SendGrid
            dynamicTemplateData: {
                resetPassUrl: link,  // Substitui o marcador {{resetPassUrl}} no template com o link
            }
        };

        try {
            await sgMail.send(msg);
            console.log("E-mail de redefinição enviado!");
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            throw new Error("Erro ao enviar e-mail de redefinição.");
        }
    }
}

module.exports = EmailService;
