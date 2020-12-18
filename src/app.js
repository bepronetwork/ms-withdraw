  
/** MACROS */
var SwaggerExpress = require('swagger-express-mw');
var app = require('express')()
/** CODE */
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Scheduler   
import { globals } from '../Globals';
import { Logger } from './helpers/logger';
import { PORT } from './config';
import { rateLimiterUsingThirdParty } from './controllers/middlewares';

//---------CODING-CHOICES--------------//

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(rateLimiterUsingThirdParty);


//--------RUN APP-------------------//

var config = {
  	appRoot: __dirname // required config
};

SwaggerExpress.create(config, async (err, swaggerExpress) => {
    if (err) { throw err; }
    // set the ENV variables if Production
	// install middleware
	swaggerExpress.register(app);
	app.listen(PORT, () => {
        Logger.success("MicroService Withdraw Running", PORT);
        globals.connect();
	});

});

module.exports = app;