require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("express");
const pool = require("./database");

const authRoutes = require("./authRoutes"); // Importa rotas de autenticação

const yaml = require("js-yaml");
const fs = require("fs");

// Carrega as queries do YAML
const queries = yaml.load(fs.readFileSync("./sql/queries.yaml", "utf8")).queries;

// Inicializa o aplicativo Express
const app = express();

// Configura middlewares
app.use(cors());
app.use(bodyParser.json());

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
            console.error("Erro ao registrar log de requisição:", error);
        }
    });

    next();
});

// Importa as rotas
app.use("/api/auth", authRoutes);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
