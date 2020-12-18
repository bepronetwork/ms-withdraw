import { Withdraw as WithdrawModel } from "../models";
class Withdraw {
    save(data){
        return new Promise((resolve, reject)=>{
            WithdrawModel.create(data)
            .then((res)=>{
                resolve(res);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }

    getAll({user, app, size, offset}){
        return new Promise((resolve, reject)=>{
            WithdrawModel.findAll({
                where: { 
                    user: user,
                    app: app
                },
                order: ['last_update_timestamp', 'DESC'],
                limit: (!size || size > 10) ? 10 : size,
                offset: !offset ? 0 : offset
            })
            .then((res)=>{
                resolve(res);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }
}

WithdrawRepository = new Withdraw();

export { WithdrawRepository };