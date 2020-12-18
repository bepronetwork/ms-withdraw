import { globals } from "../../../Globals";
let db = globals.DB;
const { DataTypes, Model } = require('sequelize');

export class Deposit extends Model {}

Deposit.init({
  user: {
    type: DataTypes.STRING
  },
  app: {
    type: DataTypes.STRING
  },
  timestamp: {
    type: DataTypes.DATE
  },
  amount: {
    type: DataTypes.NUMBER
  },
}, {
  db,
  modelName: 'Deposit'
});