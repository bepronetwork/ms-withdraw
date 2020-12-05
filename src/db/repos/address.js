import MongoComponent from './MongoComponent';
import { AddressSchema } from '../schemas';

/**
 * Accounts database interaction class.
 *
 * @class
 * @memberof db.repos.accounts
 * @requires bluebird
 * @requires lodash
 * @requires db/sql.accounts
 * @see Parent: {@link db.repos.accounts}
 */


class AddressRepository extends MongoComponent{

    constructor(){
        super(AddressSchema)
    }
    /**
     * @function setAddressModel
     * @param Address Model
     * @return {Schema} AddressModel
     */

    setModel = (Address) => {
        return AddressRepository.prototype.schema.model(Address)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            AddressRepository.prototype.schema.model.findById(_id)
            .lean()
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByAddress(address){ 
        return new Promise( (resolve, reject) => {
            AddressRepository.prototype.schema.model.findOne({'address' : address})
            .lean()
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByBitgoId(bitgo_id){ 
        return new Promise( (resolve, reject) => {
            AddressRepository.prototype.schema.model.findOne({'bitgo_id' : bitgo_id})
            .lean()
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    editAddress(id, address) {
        return new Promise((resolve, reject)=>{
            AddressRepository.prototype.schema.model.findByIdAndUpdate(
                id,
                { $set: {
                    "address" : address
                } },
                {'new' : true}
            )
            .lean()
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }
}

AddressRepository.prototype.schema = new AddressSchema();

export default AddressRepository;