import { Deposit as DepositModel } from "../models";
class Deposit {
    save(data){
        return new Promise((resolve, reject)=>{
            DepositModel.create(data)
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
            DepositModel.findAll({
                where: { 
                    user: user,
                    app: app
                },
                order: ['timestamp', 'DESC'],
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

const DepositRepository = new Deposit();

export { DepositRepository };