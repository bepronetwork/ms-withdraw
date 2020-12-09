import Heroku  from 'heroku-client';
import { HEROKU_API_TOKEN, HEROKU_API_BEARER_TOKEN, INFURA_KEY, MS_MASTER_URL, WEBSOCKET_ESPORTS, MS_WITHDRAW_URL, ETH_NET_NAME, FRONTEND_BRANCH, ENV, GITHUB_LAYOUT_REPO, MS_ESPORTS_URL } from '../../../config';
import { throwError } from '../../../controllers/Errors/ErrorManager';
import axios from 'axios';
import delay from 'delay';

const PIPELINE_ID = '5e68b1f9-557a-4272-8f4f-a0836c7e1437';
const STACK_ID = "heroku-18";
const REGION_ID = "us";
const TEAM = '333c131b-8367-4e04-9ff2-36fe2c6e337a';
const heroku = new Heroku({ token: HEROKU_API_TOKEN })
const pipeline_stage = FRONTEND_BRANCH == 'master' ? 'production' : 'staging';

class HerokuClient{
    constructor(props) {
        
    }
    
    async getAllApps(){    
        return await heroku.get('/apps');
    }

    async getAllStacks(){    
        return await heroku.get('/stacks');
    }

    async deleteApp({app}){
        return await heroku.delete(`/apps/${app}`).catch( (err) => {throw err});
    }

    async getAppPipelineDev(){
        return await heroku.get(`/pipelines/${PIPELINE_ID}/pipeline-couplings`);
    }

    async setupClientPlatform({id, name}){    
        var nameNormalized = name.replace(/,/g, "").substr(0,8);
        try{
            /* Deploy */
            const app_creation_res = await heroku.post('/teams/apps', {body: 
                {
                    name: `${new String(nameNormalized).toLowerCase()}-${new String(id).substr(5,10)}`,
                    region: REGION_ID,
                    stack : STACK_ID,
                    "locked": false,
                    "team": TEAM,
                    "personal": false,
                    "internal_routing": false
                }
            }).catch( (err) => {throw err});
            const app = app_creation_res.id;
            /* Attach to CLients Pipeline */
            await heroku.post('/pipeline-couplings', {body: 
                {
                    app,
                    pipeline: PIPELINE_ID,
                    stage: pipeline_stage

                }
            }).catch( (err) => {throw err});

            await this.addENVToApp({
                app,
                env : {
                    "NODE_ENV" : 'development',
                    "NODE_OPTIONS" : '--max-old-space-size=4596',
                    "NODE_PATH" : 'src/',
                    "REACT_APP_API_MASTER" : MS_MASTER_URL,
                    "REACT_APP_API_WITHDRAW" : MS_WITHDRAW_URL,
                    "REACT_APP_API_ESPORTS" : MS_ESPORTS_URL,
                    "REACT_APP_WEBSOCKET_ESPORTS" : WEBSOCKET_ESPORTS,
                    "REACT_APP_APP_ID" : id,
                    "REACT_APP_ETH_NETWORK" : ETH_NET_NAME,
                    "REACT_APP_INFURA_API" : `https://${ETH_NET_NAME}.infura.io/v3/${INFURA_KEY}`,
                    "REACT_APP_PRODUCTION" : 'true',
                    "SKIP_PREFLIGHT_CHECK" : 'true'
                }
            })
            /* Let System Enter HEROKU System */
            await delay(3*1000);
            /* Enable Auto Deploys */
            await this.enableAutoDeploys({app});
            /* Deploy App */
            await this.deployApp({app});
            /* Set Standard Dynos */
            await this.setDYNO({app});
            return {
                web_url : app_creation_res.web_url,
                heroku_id : app
            }
        }catch(err){
            console.log(err)
            throwError('DEPLOY_ERROR')
        }

       
    }

    async addENVToApp({app, env}){
        /* Add ENV Variable */
        return await heroku.patch(`/apps/${app}/config-vars`, {body: {...env}
        }).catch( (err) => {throw err});
    }

    async setDYNO({app}){
        /* Set DYNO Types */
        return await heroku.post(`/apps/${app}/dynos`, {
            body: {
                "attach": true,
                "command": "bash",
                "force_no_tty": null,
                "size": "hobby",
                "type": "run",
                "time_to_live": 1800
            }
        }).catch( (err) => {throw err});
    }

    async deployApp({app}){        
        return await axios.post(`https://kolkrabbi.heroku.com/apps/${app}/github/push`, {
            branch: FRONTEND_BRANCH,
        }, {
            headers : {
                "accept": "application/vnd.heroku+json; version=3",
                "accept-encoding": "gzip, deflate, br",
                "content-type": "application/json; charset=UTF-8",
                "authorization" : `Bearer ${HEROKU_API_BEARER_TOKEN}`
            }
        });
    }

    async enableAutoDeploys({app}){
        return await axios.patch(`https://kolkrabbi.heroku.com/apps/${app}/github`, {
            app,
            auto_deploy: true,
            branch: FRONTEND_BRANCH,
            githubOwner: "26004658",
            parentApp: null,
            pull_request: null,
            pull_requests: {enabled: false, auto_deploy: false},
            repo: `betprotocol/${GITHUB_LAYOUT_REPO}`,
            repo_id: 192743322,
            stale_days: null,
        }, {
            headers : {
                "accept": "application/vnd.heroku+json; version=3",
                "accept-encoding": "gzip, deflate, br",
                "content-type": "application/json; charset=UTF-8",
                "authorization" : `Bearer ${HEROKU_API_BEARER_TOKEN}`
            }
        });


    }

}

const HerokuClientSingleton = new HerokuClient();

export default HerokuClientSingleton;

