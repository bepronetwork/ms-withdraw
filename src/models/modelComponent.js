class ModelComponent{

    constructor(scope){
        this.self = {
            name : scope.name,
            logic : scope.logic,
            self : scope.self,
            params : scope.params
        };
    }


    process = async (processAction) => {
        try{
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
}


export default ModelComponent;
