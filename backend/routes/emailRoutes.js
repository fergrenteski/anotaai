const express = require("express");
const pool = require("../database/database");
const crypto = require("crypto");
const yaml = require("js-yaml");
const fs = require("fs");
const sgMail = require("@sendgrid/mail");
const path = require("path");

// Caminho para o arquivo YAML que foi incluído no deploy
const filePath = path.join(__dirname, '../sql', 'queries.yaml');
const queries = yaml.load(fs.readFileSync(filePath, 'utf8')).queries;

const router = express.Router();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Função para validar o formato do e-mail
const validarEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
};

// Função para criar o link de redefinição de senha
const gerarLinkRedefinicao = (email, token) => {
    const url = process.env.FRONTEND_URL || 'http://localhost:8080'; // Permite configuração de URL no frontend
    return `${url}/confirmPass.html?email=${email}&token=${token}`;
};

// Função para enviar e-mail com o link de redefinição
const enviarEmail = async (email, link) => {
    const msg = {
        to: email,
        from: "luizgrenfer@gmail.com",
        templateId: "d-cfa7d200e0f6408a9d00ee4cd4275f9a", // ID do template no SendGrid
        dynamicTemplateData: { resetPassUrl: link } // Substitui `{{link}}` no template
    };

    try {
        await sgMail.send(msg);
        console.log("E-mail enviado!");
    } catch (error) {
        throw new Error("Erro ao enviar e-mail: " + error.message);
    }
};

// Rota de redefinição de senha
router.post("/resetarSenha", async (req, res) => {
    const { email } = req.body;

    // Valida o formato do e-mail
    if (!validarEmail(email)) {
        return res.status(400).json({ error: "E-mail inválido!" });
    }

    try {
        const result = await pool.query(queries.select_user_by_email, [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "E-mail não encontrado!" });
        }

        const userId = result.rows[0].user_id;
        const token = crypto.randomBytes(20).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Expira em 1 hora

        // Remove as chaves antigas e insere a nova
        await pool.query(queries.remove_user_reset_password_keys, [userId]);
        await pool.query(queries.insert_user_reset_password_keys, [userId, token, expiresAt]);

        // Registra o log de redefinição de senha
        await pool.query(queries.insert_user_log_reset_password, [userId]);

        const link = gerarLinkRedefinicao(email, token);

        // Envia o e-mail
        await enviarEmail(email, link);

        res.json({ message: "E-mail enviado com sucesso!" });
    } catch (error) {
        console.error("Erro na redefinição de senha:", error);
        res.status(500).json({ error: "Erro ao redefinir senha." });
    }
});

module.exports = router;
