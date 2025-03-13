const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const sequelize = require('sequelize');

const app = express();

// Importação de módulos
const studentsRoutes = require('./src/routes/estudantes');
const electivesRoutes = require('./src/routes/eletivas');

require('./src/models/associations');  // Importando as associações (após carregar os modelos)

// Validação das variáveis de ambiente
if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST) {
    throw new Error('Configurações de ambiente ausentes. Verifique o arquivo .env.');
}

// Configuração do motor de visualização e layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware para análise de corpo de requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuração do flash middleware
app.use(flash());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use('/js', express.static(path.join(__dirname, 'src', 'public', 'js')));

// Configuração de rotas
app.use('/studantes', studentsRoutes);
app.use('/eletivas', electivesRoutes);

// Rota inicial
app.get('/', (req, res) => {
    res.render('index', { title: 'Início' });
});

app.get('/resultado', (req, res) => {
    res.render('resultado', { title: 'Resultado' });
});

// Inicializando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Exportando o aplicativo
module.exports = app;
