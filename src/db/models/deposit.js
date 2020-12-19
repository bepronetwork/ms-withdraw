import { globals } from "../../../Globals";
const db = globals.DB;
const { DataTypes } = require('sequelize');

const Deposit = db.define('Deposit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user: {
    type: DataTypes.STRING,
  },
  app: {
    type: DataTypes.STRING
  },
  timestamp: {
    type: DataTypes.DATE
  },
  amount: {
    type: DataTypes.NUMBER
  }
});

export {Deposit};