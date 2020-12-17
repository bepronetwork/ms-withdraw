import { globals } from "../../../Globals";
let db = globals.DB;
const { DataTypes, Model } = require('sequelize');

export class Withdraw extends Model {}

Withdraw.init({
  user: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  app: {
    type: DataTypes.STRING
  },
  creation_timestamp: {
    type: DataTypes.DATE
  },
  last_update_timestamp: {
    type: DataTypes.DATE
  },
  address: {
    type: DataTypes.STRING
  },
  currency: {
    type: DataTypes.STRING
  },
  transactionHash: {
    type: DataTypes.STRING
  },
  logId: {
    type: DataTypes.STRING
  },
  amount: {
    type: DataTypes.NUMBER
  },
  withdraw_external_id: {
    type: DataTypes.STRING
  },
  usd_amount: {
    type: DataTypes.NUMBER
  },
  nonce: {
    type: DataTypes.NUMBER
  },
  callback_URL: {
    type: DataTypes.STRING
  },
  request_id: {
    type: DataTypes.STRING
  },
  confirmations: {
    type: DataTypes.NUMBER
  },
  maxConfirmations: {
    type: DataTypes.NUMBER
  },
  confirmed: {
    type: DataTypes.BOOLEAN
  },
  done: {
    type: DataTypes.BOOLEAN
  },
  status: {
    type: DataTypes.STRING
  },
  isAffiliate: {
    type: DataTypes.BOOLEAN
  },
  link_url: {
    type: DataTypes.STRING
  },
  withdrawNotification: {
    type: DataTypes.STRING
  },
  note: {
    type: DataTypes.STRING
  },
  fee: {
    type: DataTypes.NUMBER
  },
}, {
  db,
  modelName: 'Withdraw'
});