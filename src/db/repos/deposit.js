import { Deposit as DepositModel } from "../models";
class Deposit {
    save(data){
        return new Promise((resolve, reject)=>{
            DepositModel.sync().then(()=>{
                DepositModel.create(data)
                .then((res)=>{
                    resolve(res);
                })
                .catch((err)=>{
                    reject(err);
                });
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }

    findByTX(transactionHash){
        return new Promise((resolve, reject)=>{
            DepositModel.sync().then(()=>{
                DepositModel.findOne({ where: { transactionHash } })
                .then((res)=>{
                    resolve(res);
                })
                .catch((err)=>{
                    reject(err);
                });
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }

    getAll({user, size, offset}){
        return new Promise((resolve, reject)=>{
            DepositModel.findAll({
                where: { 
                    user: user
                },
                limit: (!size || size > 10) ? 10 : size,
                offset: !offset ? 0 : offset,
                raw: true
            })
            .then((res)=>{
                resolve(res);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }

    getAllBackoffice({app, user, size, offset, begin_at, end_at}){
        switch (begin_at) {
            case "all":
                begin_at = new Date(new Date().setDate(new Date().getDate() - 20000));
                end_at = new Date(new Date().setDate(new Date().getDate() + 100));
                break;
            case undefined:
                begin_at = new Date(new Date().setDate(new Date().getDate() - 20000));
                break;
        }
        switch (end_at) {
            case undefined:
                end_at = (new Date(new Date().setDate(new Date().getDate() + 1))).toISOString().split("T")[0];
                break;
            case end_at:
                end_at = (new Date(new Date().setDate(new Date(end_at).getDate() + 2))).toISOString().split("T")[0];
                break;
        }
        return new Promise((resolve, reject)=>{
            DepositModel.findAll({
                where: { 
                    app: app,
                    user: user,
                    last_update_timestamp: {
                        $gte: begin_at,
                        $lte: end_at
                    }
                },
                limit: (!size || size > 10) ? 10 : size,
                offset: !offset ? 0 : offset,
                raw: true
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