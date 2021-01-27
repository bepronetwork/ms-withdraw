import { AddressLogic } from '../logic';
import { AddressRepository } from '../db/repos';
import ModelComponent from './modelComponent';

class Address extends ModelComponent{

    constructor(params){

        let db = new AddressRepository();

        super(
            {
                name : 'Address', 
                logic : new AddressLogic({db : db}), 
                db : db,
                self : null, 
                params : params,
                children : []
            }
            );
    }

    async register(){
        try{
            return await this.process('Register');
        }catch(err){
            throw err;
        }
    }
}

export default Address;