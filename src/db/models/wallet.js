import { globals } from "../../../Globals";
let db = globals.DB;
const { DataTypes } = require('sequelize');


const Wallet = db.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
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
});

export {Wallet};