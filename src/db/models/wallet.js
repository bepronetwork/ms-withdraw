import { globals } from "../../../Globals";
let db = globals.DB;
const { DataTypes, Model } = require('sequelize');

export class Wallet extends Model {}

Wallet.init({
  user: {
    type: DataTypes.STRING
  },
  app: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.STRING
  },
  currency: {
    type: DataTypes.STRING
  },
  subWalletId: {
    type: DataTypes.STRING
  },
  ticker: {
    type: DataTypes.STRING
  },
  erc20: {
    type: DataTypes.BOOLEAN
  }
}, {
  db,
  modelName: 'Wallet'
});