function __generateModel(db, object) {
    try{
        let model = db.setModel(object);
        return model;
    }catch(err) {
        throw err
    }
}

class LogicComponent{

    constructor(scope) {
		this.self = {
			//ADD
            db : scope.db
		};
    }

    async save(object){
        try{
            return await __generateModel(this.self.db, object).save();          
        }catch(err) {
            throw err;
        }
    }
}


export default LogicComponent;