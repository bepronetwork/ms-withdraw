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
  subWalletID: {
    type: DataTypes.STRING
  }
}, {
  db,
  modelName: 'Wallet'
});