import { globals } from "../../../Globals";
let db = globals.DB;
const { DataTypes } = require('sequelize');


const Deposit = db.define('Deposit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
});

export {Deposit};