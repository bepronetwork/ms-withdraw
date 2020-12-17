import { Withdraw } from "../models/withdraw";
class WithdrawRepository {
    save(data){
        return new Promise((resolve, reject)=>{
            Withdraw.create(data)
            .then((res)=>{
                resolve(res);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }
}

WithdrawRepository = new WithdrawSchema();

export { WithdrawRepository };