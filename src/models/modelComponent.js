class ModelComponent{

    constructor(scope){
        this.self = {
            name : scope.name,
            logic : scope.logic,
            db : scope.db,
            self : scope.self,
            params : scope.params,
            children : scope.children || []
        };
    }


    process = async (processAction) => {
        try{
            if(this.self.children.length > 0){
                /** There are dependencies */
                for( var i = 0; i < this.self.children.length ; i++){
                    await this.processChild(this.self.children[i], processAction);
                }
            }
            /* Normalize Object */
            this.self.normalizedSelf = await this.self.logic.objectNormalize(this.self.params, processAction);
            /* Test Parameteres */
            await this.self.logic.testParams(this.self.normalizedSelf, processAction);
            /* Progress Actions */
            let model = await this.self.logic.progress(this.self.normalizedSelf, processAction);

            return model;
        }catch(err){
            throw err
        }
    }

    processChild = async (child, processAction) => {
        let object = await child.process(processAction);
        if(object){
            this.self.params = {
                ...this.self.params, 
                [object.type] : object._doc._id
            }
        }
    }
}


export default ModelComponent;
