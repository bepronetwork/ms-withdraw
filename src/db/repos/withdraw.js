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
}

const WithdrawRepository = new Withdraw();

export { WithdrawRepository };