// Importa o dotenv para carregar variáveis de ambiente
require("dotenv").config();

// Importa os módulos necessários
const express = require("express");
const cors = require("cors");
const bodyParser = require("express");
const jwt = require("jsonwebtoken");
const pool = require("./database");
const bcrypt = require("bcryptjs");
const yaml = require("js-yaml");
const fs = require("fs");
const { log } = require("console");

// Carrega as queries do YAML
const queries = yaml.load(fs.readFileSync("./sql/queries.yaml", "utf8")).queries;

// Inicializa o aplicativo Express
const app = express();

// Configura middlewares
app.use(cors());
app.use(bodyParser.json());

// Função para gerar um token JWT
const gerarToken = (usuario) => {
    return jwt.sign(
        { id: usuario.id, nome: usuario.nome, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};

const logError = (message, error) => {
  console.error(message + ": ", error);
}

// Rota de cadastro de usuário
app.post("/api/cadastro", async (req, res) => {
    const { nome, email, senha, confirmacaoSenha } = req.body;

    if (senha !== confirmacaoSenha) {
        return res.status(400).json({ error: "As senhas não conferem!" });
    }

    try {
        const existe = await pool.query(queries.select_user_by_email, [email]);

        if (existe.rows.length > 0) {
            return res.status(400).json({ error: "E-mail já cadastrado!" });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const result = await pool.query(queries.insert_user, [nome, email, senhaHash]);

        // Registra o log de cadastro
        await pool.query(queries.insert_user_log_register, [result.rows[0].user_id]);

        const token = gerarToken(result.rows[0]);
        res.json({ message: "Cadastro realizado com sucesso!", token });
    } catch (error) {
        logError("Erro no cadastro", error);
        res.status(500).json({ error: "Erro ao cadastrar usuário." });
    }
});

// Rota de login de usuário
app.post("/api/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await pool.query(queries.select_user_by_email, [email]);

        if (usuario.rows.length === 0) {
            return res.status(401).json({ error: "E-mail ou senha inválidos!" });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.rows[0].senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: "E-mail ou senha inválidos!" });
        }

        // Registra o log de login
        await pool.query(queries.insert_user_log_login, [usuario.rows[0].user_id]);

        const token = gerarToken(usuario.rows[0]);
        res.json({ message: "Login realizado com sucesso!", token });
    } catch (error) {
        logError("Erro no login", error);
        res.status(500).json({ error: "Erro ao realizar login." });
    }
});

// Middleware para log de requisições
app.use((req, res, next) => {
  res.on("finish", async () => {
    const { method, originalUrl } = req;
    const status_code = res.statusCode;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers["user-agent"];

    try {
        await pool.query(queries.insert_request_log, [method, originalUrl, status_code, ip_address, user_agent]);
    } catch (error) {
        logError("Erro ao registrar log de requisição", error);
    }
  });

    res.on("error", async (error) => {
      const { method, originalUrl } = req;
      const status_code = res.statusCode || 500;
      const ip_address = req.ip || req.connection.remoteAddress;
      const user_agent = req.headers["user-agent"];
      console.error("Erro na requisição:", method, originalUrl, status_code, error);
      try {
          await pool.query(queries.insert_request_log, [method, originalUrl, status_code, ip_address, user_agent]);
      } catch (err) {
        logError("Erro ao registrar log de requisição", error);
      }
    });
    next();
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
