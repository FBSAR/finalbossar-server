require('dotenv').config();
const Profile = require('../models/profile.model.ts');
import { Network, Alchemy, Contract, Wallet } from 'alchemy-sdk';

interface Profile {
    firstName: string,
    lastName: string,
    email: string,
    walletAddress?: string,
    password: string,
}

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
const contractAddress = String(process.env.BOSSCOIN_CONTRACT_ADD);
const testAccount = String(process.env.MM_TEST_ACCOUNT);
const settings = {
    apiKey: String(alchemy_key),
    network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

exports.totalSupply = async (req: any, res: any) =>{
    const provider = await alchemy.config.getProvider()
    const wallet = new Wallet(metaMaskPrivateKey, provider);
    const BossCoinContract = new Contract(contractAddress, abi, wallet);
    const totalSupply = await BossCoinContract.totalSupply();
    console.log(`Total Supply: ${totalSupply}`);
    return res.status(200).json({supply: totalSupply});    
}


/**
 * TODO:
 * Get user's MetaMask Address from Request
 * Check to see if that Email or Wallet address has already recieved the free BOSSC.
 * Create listen events to listen for Final Boss Register Event
 * MetaMask quick register for first time users.
 * Should users get a chance at getting the 100 BOSSC if the opted out at registration?
 * Provider vs Signer
 * Handling Errors
 */ https://docs.metamask.io/guide/create-dapp.html#basic-action-part-1

exports.balanceOf = async (req: any, res: any) => {
    let recepientEmail = req.body.email;
    let recepientAddress = req.body.walletAddress;
    let provider = await alchemy.config.getProvider();
    let wallet = new Wallet(metaMaskPrivateKey, provider);
    let BossCoinContract = new Contract(contractAddress, abi, wallet);
    const balance = await BossCoinContract.balanceOf(recepientAddress);
    console.log(`Total Supply: ${balance}`);
    return res.status(200).json({balance: `${balance}`});    

}

export {};
