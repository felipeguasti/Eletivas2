const sequelize = require('./src/config/db');
const Eletiva = require('./src/models/Eletiva');
const Estudante = require('./src/models/Estudante');

async function sincronizarModelos() {
  try {
    // Habilita o log das queries SQL no console
    await sequelize.sync({ force: true, logging: console.log });

    console.log('Tabelas atualizadas com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar tabelas:', error);
  }
}

sincronizarModelos();
