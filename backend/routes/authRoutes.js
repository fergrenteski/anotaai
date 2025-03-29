const express = require("express");
const pool = require("../database/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, '../sql', 'queries.yaml');
const queries = yaml.load(fs.readFileSync(filePath, 'utf8')).queries;
const router = express.Router();

// Constantes de configuração
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "1h"; // Tempo de expiração do token
const SALT_ROUNDS = 10; // Quantidade de rounds para o bcrypt

// Função para gerar um token JWT
const gerarToken = (usuario) => {
    return jwt.sign(
        { id: usuario.id, nome: usuario.nome, email: usuario.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );
};

// Função para verificar a senha
const verificarSenha = async (senha, senhaHash) => {
    return await bcrypt.compare(senha, senhaHash);
};

// Função para registrar logs
const registrarLog = async (query, params) => {
    await pool.query(query, params);
};

// Rota de cadastro de usuário
router.post("/cadastro", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
    }

    try {
        const existe = await pool.query(queries.select_user_by_email, [email]);

        if (existe.rows.length > 0) {
            return res.status(400).json({ error: "E-mail já cadastrado!" });
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const senhaHash = await bcrypt.hash(senha, salt);

        const result = await pool.query(queries.insert_user, [nome, email, senhaHash]);

        // Registra o log de cadastro
        await registrarLog(queries.insert_user_log_register, [result.rows[0].user_id]);

        const token = gerarToken(result.rows[0]);
        res.json({ message: "Cadastro realizado com sucesso!", token });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({ error: "Erro ao cadastrar usuário." });
    }
});

// Rota de login de usuário
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios!" });
    }

    try {
        const usuario = await pool.query(queries.select_user_by_email, [email]);

        if (usuario.rows.length === 0) {
            return res.status(401).json({ error: "E-mail ou senha inválidos!" });
        }

        const senhaCorreta = await verificarSenha(senha, usuario.rows[0].senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: "E-mail ou senha inválidos!" });
        }

        // Registra o log de login
        await registrarLog(queries.insert_user_log_login, [usuario.rows[0].user_id]);

        const token = gerarToken(usuario.rows[0]);
        res.json({ message: "Login realizado com sucesso!", token });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Erro ao realizar login." });
    }
});

module.exports = router;
