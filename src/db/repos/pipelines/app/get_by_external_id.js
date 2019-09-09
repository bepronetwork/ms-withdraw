import mongoose from 'mongoose';


const pipeline_get_by_external_id = (app_id, user_external_id) => 
    [
        //Stage 0
    {
        '$match' : {
            "_id" : mongoose.Types.ObjectId(app_id)
        }
    },  {
        '$lookup': {
          'from': 'users', 
          'localField': 'external_users', 
          'foreignField': 'external_id', 
          'as': 'users'
        }
      }, {
        '$unwind': {
          'path': '$users'
        }
      }, {
        '$match': {
          'users.external_id': user_external_id
        }
      }, {
        '$project': {
          '_id': false, 
          'user': '$users'
        }
      }
]

export default pipeline_get_by_external_id;


