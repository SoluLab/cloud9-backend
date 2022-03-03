import bcrypt from 'bcryptjs';
import Web3 from 'web3';
import CloudNineICO from '../../../../artifacts/contracts/CloudNineICOFlat.sol/CloudNineICO.json';
import CloudNineToken from '../../../../artifacts/contracts/CloudNine.sol/ERC20.json';
import User from '../user/userModel.js';
import { default as config } from '../../config/config.js';
import logger from '../../config/logger.js';
import axios from 'axios';

const web3 = new Web3(new Web3.providers.HttpProvider(config.alchemyUrl));
const contract = new web3.eth.Contract(
	CloudNineICO.abi,
	config.contracts.icoContract
);
const tokenContract = new web3.eth.Contract(
	CloudNineToken.abi,
	config.contracts.tokenContract
);

const hashPassword = async (password) => {
	password = await bcrypt.hash(password, 12);
	return password;
};

export const signUpService = async () => {
	try {
		let password = '';
		const user = await User.findOne({ email: config.adminCreds.adminEmail });
		if (user) return { err_msg: 'User already exists', statusCode: 201 };
		password = await hashPassword(config.adminCreds.adminPassword);

		const newUser = await User.create({
			email: config.adminCreds.adminEmail,
			password: password,
			name: config.adminCreds.adminName,
			isAdmin: true,
		});
		if (!newUser)
			return {
				err_msg: 'Something went wrong please try again',
				statusCode: 400,
			};
		return { _id: newUser._id, email: newUser.email, name: newUser.name };
	} catch (error) {
		throw error;
	}
};

export const getAllUsersService = async () => {
	logger.info('Inside getAllUsers Service');
	try {
		let user = await User.find().lean();

		user = await Promise.all(
			user.map(async (element) => {
				const { walletAddress } = element;
				if (walletAddress) {
					const walletBalance = await getWalletBalanceService(walletAddress);
					const { userBalance, symbol } = walletBalance;
					Object.assign(element, { userBalance });
					Object.assign(element, { symbol });
					return element;
				} else {
					Object.assign(element, { userBalance: '0' });
					Object.assign(element, { symbol: 'C9' });
					return element;
				}
			})
		);

		return user;
	} catch (error) {
		throw error;
	}
};

export const getWalletBalanceService = async (walletAddress) => {
	try {
		logger.info('Inside getWalletBalance Service');

		const name = await tokenContract.methods.name().call();
		const symbol = await tokenContract.methods.symbol().call();
		const decimals = await tokenContract.methods.decimals().call();
		const totalSupply = await tokenContract.methods.totalSupply().call();
		const userBalance = await tokenContract.methods
			.balanceOf(walletAddress)
			.call();

		return {
			name,
			symbol,
			decimals,
			totalSupply: totalSupply / 10 ** decimals,
			userBalance: userBalance / 10 ** decimals,
			walletAddress,
			dollarValue: (userBalance / 10 ** decimals) * 0.0075,
		};
	} catch (error) {
		throw error;
	}
};
export const getAllTransactionsService = async () => {
	try {
		const transactions = await axios.get(
			`${config.getTransactionAPI.endpoint}?module=${config.getTransactionAPI.module}&action=${config.getTransactionAPI.action}&contractaddress=${config.contracts.tokenContract}&address=${config.contracts.icoContract}&startblock=${config.getTransactionAPI.startblock}&endblock=${config.getTransactionAPI.endblock}&page=${config.getTransactionAPI.page}&offset=${config.getTransactionAPI.offset}&sort=${config.getTransactionAPI.sort}&apikey=${config.etherscanApiKey}`
		);
		if (transactions.data.message === 'OK') return transactions.data;
		return {
			err: transactions.data.result,
			err_msg: transactions.data.message,
		};
	} catch (error) {
		throw error;
	}
};
