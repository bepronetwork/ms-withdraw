import { globals } from "../../../Globals";
let db = globals.DB;
const { DataTypes } = require('sequelize');


const Deposit = db.define('Deposit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user:{
    type: DataTypes.STRING
  },
  app:{
    type: DataTypes.STRING
  },
  creation_timestamp:{
    type: DataTypes.DATE
  },
  last_update_timestamp:{
    type: DataTypes.DATE
  },
  address:{
    type: DataTypes.STRING
  },
  currency:{
    type: DataTypes.STRING
  },
  transactionHash:{
    type: DataTypes.STRING
  },
  amount:{
    type: DataTypes.NUMBER
  },
  deposit_external_id:{
    type: DataTypes.STRING
  },
  usd_amount:{
    type: DataTypes.NUMBER
  },
  callback_URL:{
    type: DataTypes.STRING
  },
  confirmations:{
    type: DataTypes.NUMBER
  },
  maxConfirmations:{
    type: DataTypes.NUMBER
  },
  confirmed:{
    type: DataTypes.BOOLEAN
  },
  link_url:{
    type: DataTypes.STRING
  },
  isPurchase:{
    type: DataTypes.BOOLEAN
  },
  purchaseAmount:{
    type: DataTypes.NUMBER
  },
  fee:{
    type: DataTypes.NUMBER
  },
  hasBonus:{
    type: DataTypes.BOOLEAN
  },
  bonusAmount:{
    type: DataTypes.NUMBER
  }
});

export {Deposit};