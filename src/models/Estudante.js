const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const Eletiva = require('./Eletiva');

class Estudante extends Model {}

Estudante.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    turma: { type: DataTypes.STRING, allowNull: false },
    eletivaId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'eletivas', key: 'id' } }
}, {
    sequelize,
    modelName: 'Estudante',
    tableName: 'estudantes',
    timestamps: true
});

module.exports = Estudante;
