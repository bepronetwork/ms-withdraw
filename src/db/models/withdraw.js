import { globals } from "../../../Globals";
const db = globals.DB;
const { DataTypes } = require('sequelize');

const Withdraw = db.define('Withdraw', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
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
});

export {Withdraw};