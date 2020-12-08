const subCommands = process.argv.slice(2);

switch (subCommands[0].toUpperCase()) {
    case "BTC": {
        const start = require("./src/commands/setAutoWallet.js");
        start(subCommands[1], "btc");
        break;
    }
    case "ETH": {
        const start = require("./src/commands/setAutoWallet.js");
        start(subCommands[1], "eth");
        break;
    }
}