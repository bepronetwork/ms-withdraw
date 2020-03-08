import MongoComponent from './MongoComponent';
import { IntegrationsSchema } from '../schemas/integrations';

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


class IntegrationsRepository extends MongoComponent{

    constructor(){
        super(IntegrationsSchema)
    }
    /**
     * @function setIntegrationsModel
     * @param Integrations Model
     * @return {Schema} IntegrationsModel
     */

    setModel = (Integrations) => {
        return IntegrationsRepository.prototype.schema.model(Integrations)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            IntegrationsRepository.prototype.schema.model.findById(_id)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }
}

IntegrationsRepository.prototype.schema = new IntegrationsSchema();

export default IntegrationsRepository;