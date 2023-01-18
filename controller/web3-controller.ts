require('dotenv').config();
import { Network, Alchemy, AlchemySettings, Contract, Wallet } from 'alchemy-sdk';

const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function totalSupply() view returns (uint)",
    "function decimals() view returns (uint8)",
    "function name() public view returns (string)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",
    "function transferFrom(address sender, address recipient, uint amount) returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
];

const alchemy_key = String(process.env.ALCHEMY_API_KEY);
const metaMaskPrivateKey = String(process.env.MM_PRIVATE_KEY);
const settings: AlchemySettings = {
    apiKey: 'em0H5LwtJwzywUm0OHRWWuPOgaTPcx6s',
    network: Network.ETH_GOERLI,
    maxRetries: 3
};

const alchemy = new Alchemy(settings);

// Total Supply = 120,000,000 Jan/16/2023 
exports.totalSupply = async (req: any, res: any) =>{
    const provider = await alchemy.config.getProvider()
    const wallet = await new Wallet(metaMaskPrivateKey, provider);
    const BossCoinContract = await new Contract(contractAddress, abi, wallet);
    const totalSupply = await BossCoinContract.totalSupply();
    console.log(`Total Supply: ${totalSupply}`);
    return res.status(200).json({supply: totalSupply});    
}
// Total Supply = 120,000,000 Jan/16/2023 
exports.totalCoinsInCirculation = async (req: any, res: any) =>{
    const provider = await alchemy.config.getProvider()
    const wallet = await new Wallet(metaMaskPrivateKey, provider);
    const BossCoinContract = await new Contract(contractAddress, abi, wallet);
    
    // Needs to be modified each time coins are minted
    const totalCoinsMinted = 120000000;
    const totalSupply = await BossCoinContract.totalSupply();
    const totalInCirc = totalCoinsMinted - totalSupply;
    console.log(`Total Coins in Circulation: ${totalInCirc}`);
    return res.status(200).json({total: totalInCirc});    
}

const contractAddress = String(process.env.BOSSCOIN_CONTRACT_ADD);

exports.balanceOf = async (req: any, res: any) => {
    let recepientAddress = req.body.walletAddress;
    let provider = await alchemy.config.getProvider();
    let wallet = new Wallet(metaMaskPrivateKey, provider);
    let BossCoinContract = new Contract(contractAddress, abi, wallet);
    const balance = await BossCoinContract.balanceOf(recepientAddress);
    console.log(`Total Supply: ${balance}`);
    return res.status(200).json({balance: `${balance}`});    

}

exports.getAllTransactions = async (req: any, res: any) => {
    await alchemy.core.getBlock('0x2e7e7c9513a43a11166cf657591e9be680a5b420914a3ec0db0e1029abed0da4')
        .then( data => {
            console.log(data);
            return res.status(200).json(data);    
        })
}

export {};
