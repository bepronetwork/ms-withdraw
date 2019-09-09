import {User} from '../../models';

class Authentication {

    constructor(params){
        try{
            this.user = {
                username : Buffer.from(params.split(":")[0], 'base64').toString(),
                password : Buffer.from(params.split(":")[1], 'base64').toString()
            }
        }catch(err){
            throw err;
        }
    }

    authenticate = async () => {
        try{
            this.user = await this._login(this.user.username, this.user.password);
        }catch(error){
            throw error;
        }
    }   

    unencode = (data, type_return='String') => {
        switch(type_return){
            case('String')  : return Buffer.from(data, 'base64').toString();
            case('JSON')    : return JSON.parse(Buffer.from(data, 'base64').toString())  
        }
        
    }

    _login = async (username, password) => {
        try{
            return await User.prototype.Login(username, password)
        }catch(error){
            throw error
        }
    }
}

export default Authentication;