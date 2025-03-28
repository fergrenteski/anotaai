const express = require("express");
const pool = require("../database/database");
const crypto = require("crypto");
const yaml = require("js-yaml");
const fs = require("fs");
const sgMail = require("@sendgrid/mail");

// Carrega as queries do YAML
const queries = yaml.load(fs.readFileSync("./sql/queries.yaml", "utf8")).queries;

const router = express.Router();

sgMail.setApiKey("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");

router.post("/resetarSenha", async (req, res) => {
    const { email } = req.body;

    try {
        const result = await pool.query(queries.select_user_by_email, [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "E-mail não Existe" });
        }

        const userId = result.rows[0].user_id;
        const token = crypto.randomBytes(20).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(queries.insert_user_reset_password_keys,[userId, token, expiresAt ]);
        // Registra o log de cadastro
        await pool.query(queries.insert_user_log_reset_password, [result.rows[0].user_id]);

        // Link de redefinição de senha
        const link = `http://localhost:3000/redefinir-senha.html?token=${token}`;

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
            console.error("Erro ao enviar e-mail:", error);
        }

    } catch (error) {
        console.error("Erro na redefinição de senha:", error);
        res.status(500).json({ error: "Erro ao redefinir senha." });
    }
});


module.exports = router;