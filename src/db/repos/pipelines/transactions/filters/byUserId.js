import mongoose from 'mongoose';


const byUserId = (_id) => {
    return ({
        '$match' : { 
            "user._id" : mongoose.Types.ObjectId(_id),
        }
    })
}
    
export default byUserId;
