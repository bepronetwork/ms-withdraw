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

    findByIdAndUpdateTX({id, tx, link_url, status, note, last_update_timestamp}){
        return new Promise((resolve, reject)=>{
            WithdrawModel.update(
                {
                    transactionHash: tx,
                    link_url: link_url,
                    status: status,
                    note: note,
                    last_update_timestamp: last_update_timestamp
                },
                {
                    where: {
                        id: id
                    }
                }
            )
            .then((res)=>{
                resolve(res);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }
}

const WithdrawRepository = new Withdraw();

export { WithdrawRepository };