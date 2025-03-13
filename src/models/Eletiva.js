const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

const Eletiva = sequelize.define("Eletiva", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false, unique: true },
    professor: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    tableName: "eletivas",
    timestamps: true
});

module.exports = Eletiva;
