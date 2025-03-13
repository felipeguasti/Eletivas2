const Estudante = require('./Estudante');
const Eletiva = require('./Eletiva');

// Definição das Associações com Alias
Estudante.belongsTo(Eletiva, { foreignKey: 'eletivaId', as: 'eletiva' });  // Usando 'eletiva' como alias
Eletiva.hasMany(Estudante, { foreignKey: 'eletivaId', as: 'estudantes' });  // Usando 'estudantes' como alias

module.exports = { Estudante, Eletiva };
