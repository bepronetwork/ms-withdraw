
const delay = require('delay');

var ConsoleReader = (log, resolveTo, TIMEOUT) => {
	let input;
	let resolved = false;

	async function readAs(array){
		do{
			console.log(`\n${log}`)
			input = await stdin(TIMEOUT);
		}while(!exists(array))

		return input;
	}

	async function stdin(TIMEOUT){
		return new Promise( (resolve, reject) => {
			try{
				delay(TIMEOUT).then( () => {
					if(!resolved){
						console.log(`Auto Resolved to : ${resolveTo}...`);
						resolve(resolveTo)
					}
				})

				process.stdin.on('data', function (string) {
					resolved = true;
					resolve(string.toString().trim())
				});
			}catch(err){
				reject(err);
			}
		});
	}

	function exists(array){
		return (array.indexOf(input) >= 0 )
	}


	return ({
		readAs : readAs
	})

}

exports = module.exports = ConsoleReader;