# 🚀 Aplicação de Cadastro e Login com Node.js e PostgreSQL

Este projeto é um sistema de login e cadastro básico utilizando **Node.js**, **PostgreSQL** e **Docker**.

## 📌 Tecnologias utilizadas

- **Backend**: Node.js + Express.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Token)
- **Gerenciamento de ambiente**: Docker Compose

## 🚀 Como rodar o projeto

### 📦 Requisitos

- **Docker** e **Docker Compose** instalados

### 🔥 Executando o projeto

1. Clone este repositório:

   ```sh
   git clone https://luizgrenteski1@bitbucket.org/pucpr-team-engsoft/anotaai.git
   cd anotaai
   ```

2. Suba os containers (PostgreSQL, frontend e backend):

   ```sh
   docker-compose up -d
   ```

3.O frontend estará rodando em:

  **<http://localhost:8080>**

3.O backend estará rodando em:  

  **<http://localhost:3000>**

### 🔗 Endpoints disponíveis

| Método  | Rota       | Descrição                |
|---------|-----------|--------------------------|
| POST    | `api/cadastro` | Cadastrar novo usuário |
| POST    | `api/login`   | Realizar login         |

## 🛠 Personalização

Caso queira modificar as credenciais do banco, edite o arquivo `.env` antes de rodar o projeto.
