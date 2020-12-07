const subCommands = process.argv.slice(2)[0].split("=");

switch (subCommands[0]) {
    case "BTCWalletId": {
        const start = require("./src/commands/setAutoWallet.js");
        start(subCommands[1], "btc");
        break;
    }
    case "ETHWalletId": {
        const start = require("./src/commands/setAutoWallet.js");
        start(subCommands[1], "eth");
        break;
    }
}