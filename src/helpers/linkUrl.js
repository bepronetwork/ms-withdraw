import { ENV } from "../config";

export const setLinkUrl = ({ ticker, address, isTransactionHash }) => {
    var link_url;
    if (ENV === "development") {
        switch (new String(ticker).toLowerCase().trim()) {
            case 'eth': {
                link_url = `https://kovan.etherscan.io/${isTransactionHash ? 'tx' : 'address'}/${address}`;
                return link_url;
            };
            case 'btc': {
                link_url = `https://testnet.smartbit.com.au/${isTransactionHash ? 'tx' : 'address'}/${address}`;
                return link_url;
            };
            default:
                link_url = address;
                return link_url;
        }
    } else if (ENV === "production") {
        switch (new String(ticker).toLowerCase().trim()) {
            case 'eth': {
                link_url = `https://etherscan.io/${isTransactionHash ? 'tx' : 'address'}/${address}`;
                return link_url;
            };
            case 'btc': {
                link_url = `https://live.blockcypher.com/btc/${isTransactionHash ? 'tx' : 'address'}/${address}`;
                return link_url;
            };
            default:
                link_url = address;
                return link_url;
        }
    }
}