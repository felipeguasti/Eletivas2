const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ajuste o caminho do arquivo conforme sua estrutura

class CacheTimestamp extends Model {}

CacheTimestamp.init(
  {
    timestamp: {
      type: DataTypes.BIGINT, // Altere para BIGINT
      allowNull: false,
      defaultValue: 0, // Valor inicial que indica que nunca foi feito o fetch
    },
    operation: {
      type: DataTypes.STRING, // Pode ser algo como 'eletivas', 'estudantes', etc.
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'CacheTimestamp',
    tableName: 'cache_timestamp',
    timestamps: false,
  }
);

module.exports = CacheTimestamp;
