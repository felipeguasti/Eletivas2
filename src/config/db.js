const { Sequelize } = require('sequelize');
require('dotenv').config(); // Importa as variáveis de ambiente

// Credenciais do banco de dados externo
// const database = "u612973268_broadcast";
// const username = "u612973268_broadcast";
// const password = "E1=iTrLXsvk";
// const host = "195.35.61.61"; // Endereço IP do banco de dados externo
// const dialect = "mysql";

// Credenciais do banco de dados a partir do arquivo .env
const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const dialect = process.env.DB_DIALECT;

// Inicializar a conexão com o banco de dados
const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: dialect,
    logging: false, // Desabilita o log
});

// Testar a conexão
sequelize.authenticate()
    .then(() => {
        console.log('Conexão com MySQL estabelecida com sucesso!');
    })
    .catch(err => {
        console.error('Erro ao conectar ao MySQL:', err);
    });

// Exportar a instância do Sequelize para ser utilizada em outras partes do projeto
module.exports = sequelize;
