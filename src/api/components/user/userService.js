import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Stripe from 'stripe';
import Web3 from 'web3';
import CloudNineICO from '../../../../artifacts/contracts/CloudNineICO.sol/CloudNineICO.json';
import CloudNineToken from '../../../../artifacts/contracts/CloudNine.sol/ERC20.json';
import Common from '@ethereumjs/common';
import Tx from '@ethereumjs/tx';
import User from './userModel.js';
import axios from 'axios';
import { default as config } from '../../config/config.js';
import geoip from 'geoip-lite';
import logger from '../../config/logger.js';

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

export const signUpService = async (data) => {
	try {
		const { email, name } = data;
		let { password } = data;
		const user = await User.findOne({ email });
		if (user) return { err_msg: 'User already exists', statusCode: 201 };
		password = await hashPassword(password);

		const newUser = await User.create({
			email,
			password,
			name,
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

export const getUserProfileService = async (id) => {
	try {
		const user = await User.findById(id);
		if (user.loginHistory.length > 0) user.loginHistory = user.loginHistory[0];
		return user;
	} catch (error) {
		throw error;
	}
};

export const updateUserProfileService = async (id, body) => {
	try {
		const user = await User.findOne({ _id: id }).select('+password');
		if (body.newPassword) {
			if (!(await bcrypt.compare(body.oldPassword, user.password)))
				return { err_msg: 'oldPassword is not correct' };
			body.password = await hashPassword(body.newPassword);
			body.passwordChangedAt = Date.now();
			delete body.newPassword;
			delete body.oldPassword;
		}
		if (body.oldPassword)
			return {
				err_msg: 'Please provide newPassword to update password',
				statusCode: 201,
			};

		const data = await User.findOneAndUpdate({ _id: id }, body, { new: true });
		if (!data)
			return {
				err_msg: 'Something went wrong please try again',
				statusCode: 400,
			};
		return data;
	} catch (error) {
		throw error;
	}
};

export const userLoginService = async (body, clientIp) => {
	try {
		const ip = clientIp.split(':').pop();
		const location = geoip.lookup(ip);
		const loginData = {
			ip,
			region: location?.country,
		};
		const { email, password } = body;
		let user = await User.findOne({ email }, 'loginHistory email name').select(
			'+password'
		);
		if (!user)
			return {
				err_msg: `User doesn't exist with this email please signUp`,
				statusCode: 401,
			};

		if (!(await bcrypt.compare(password, user.password))) {
			loginData.status = 'fail';
			user.loginHistory.unshift(loginData);
			user.save();
			return { err_msg: 'email or password is not correct', statusCode: 401 };
		}

		const token = jwt.sign(
			{ id: user._id, email: user.email },
			config.jwtSecret,
			{
				expiresIn: config.jetExpiresIn,
			}
		);

		const cookieOptions = {
			expires: new Date(Date.now() + config.jetExpiresIn * 24 * 60 * 60 * 1000),
			httpOnly: true,
		};
		if (config.nodeEnv === 'production') cookieOptions.secure = true;
		loginData.status = 'success';
		user.loginHistory.unshift(loginData);
		user.save();
		user = { email: user.email, _id: user._id, name: user.name };
		return { token, cookieOptions, user };
	} catch (error) {
		throw error;
	}
};

export const loggedInService = async (token) => {
	try {
		// verify token
		const verifiedToken = await promisify(jwt.verify)(token, config.jwtSecret);

		// Check if user exists
		const user = await User.findById(verifiedToken.id);
		if (!user) {
			return { err_msg: `User doesn't exists`, statusCode: 201 };
		}

		// Check if user changed password after the jwt_token was issued
		if (
			user.passwordChangedAt &&
			verifiedToken.iat < parseInt(user.passwordChangedAt.getTime() / 1000, 10)
		)
			return {
				err_msg: 'Password changed please login again',
				statusCode: 401,
			};

		return user;
	} catch (error) {
		throw error;
	}
};

export const storeWalletAddressService = async (email, body) => {
	try {
		const { walletAddress } = body;
		if (!walletAddress)
			return {
				err_msg: 'Please include walletAddress to save',
				statusCode: 201,
			};
		const data = await User.findOneAndUpdate({ email }, { walletAddress });
		if (!data)
			return {
				err_msg: 'Something went wrong please try again',
				statusCode: 400,
			};
		return data;
	} catch (error) {
		throw error;
	}
};

export const getCheckoutService = async (data) => {
	try {
		const stripe = Stripe(config.stripeSecretKey);

		// Add card by creating paymentMethod
		// eslint-disable-next-line camelcase
		const { number, exp_month, exp_year, cvc } = data;
		const { id } = await stripe.paymentMethods.create({
			type: 'card',
			card: {
				number,
				exp_month,
				exp_year,
				cvc,
			},
		});

		// Create PaymentIntent
		// eslint-disable-next-line camelcase
		const { client_secret } = await stripe.paymentIntents.create({
			amount: 2000,
			currency: 'usd',
			payment_method: id,
			description: 'Cloud9',
		});

		// eslint-disable-next-line camelcase
		return client_secret;
	} catch (error) {
		throw error;
	}
};

export const getTransactionsService = async (queryString) => {
	try {
		const { contractAddress, address } = queryString;
		const transactions = await axios.get(
			`${config.getTransactionAPI.endpoint}?module=${config.getTransactionAPI.module}&action=${config.getTransactionAPI.action}&contractaddress=${contractAddress}&address=${address}&startblock=${config.getTransactionAPI.startblock}&endblock=${config.getTransactionAPI.endblock}&page=${config.getTransactionAPI.page}&offset=${config.getTransactionAPI.offset}&sort=${config.getTransactionAPI.sort}&apikey=${config.etherscanApiKey}`
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

export const getLoginHistoryService = async (id) => {
	try {
		const user = await User.findById(id, 'loginHistory').lean();
		if (!user) return;
		if (!user.loginHistory) return { loginHistory: [] };
		user.loginHistory.forEach((el) => {
			const date = new Date(el.date);
			el.date = date.toDateString();
			el.time = date.toTimeString();
		});
		return { loginHistory: user.loginHistory };
	} catch (error) {
		throw error;
	}
};

export const sendTokensToUserService = async (recipient, amount) => {
	try {
		logger.info('Inside sendTokenToUser Service');
		const amountToBeTransferred = (amount / 2) * 10 ** 18;
		console.log(amountToBeTransferred);
		const nonce = await web3.eth.getTransactionCount(
			`${config.contractAccounts.deploymentAddress}`,
			'pending'
		);
		const gasPriceEstimate = await axios.get(config.gasPriceEstimateUrl);
		const txData = {
			nonce: web3.utils.toHex(nonce),
			gasPrice: web3.utils.toHex(
				web3.utils.toWei(`${gasPriceEstimate.data.fast}`, 'Gwei')
			),
			gasLimit: web3.utils.toHex('3000000'),
			from: `${config.contractAccounts.deploymentAddress}`,
			to: `${config.contracts.icoContract}`,
			value: '0x00',
			data: contract.methods
				.sendTokens(recipient, web3.utils.toBN(amount))
				.encodeABI(),
		};

		const common = Common.default.custom({
			name: 'matic',
			networkId: 80001,
			chainId: 80001,
		});

		const tx = Tx.Transaction.fromTxData(txData, { common });
		const privateKey = Buffer.from(
			`${config.contractAccounts.deploymentPrivateKey}`,
			'hex'
		);
		const signedTx = tx.sign(privateKey);
		const serializedTx = signedTx.serialize();

		const receipt = await web3.eth.sendSignedTransaction(
			`0x${serializedTx.toString('hex')}`
		);
		return receipt;
	} catch (error) {
		throw error;
	}
};

export const getWalletBalanceService = async (walletAddress, tokenAddress) => {
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

export const getPieChartDetailsService = async () => {
	try {
		logger.info('Inside getPieChartDetails Service');
		const totalSupply = '100%';
		const icoPhase1 = '1%';
		const icoPhase2 = '2.5%';
		const icoPhase3 = '3%';
		const icoPhase4 = '4.5%';
		const icoPhase5 = '5%';
		const icoPhase6 = '20%';
		const teamTokens = '3%';
		const founder = '10%';
		const avilesFamily = '0%';
		const influencersBounty = '2%';
		const lendingProgram = '8%';
		const legal = '4%';
		const reserveForDEXCEX = '15%';
		const stakingReward = '15%';
		const reserves = '7%';

		return {
			'ICO Round 1': icoPhase1,
			'ICO Round 2': icoPhase2,
			'ICO Round 3': icoPhase3,
			'ICO Round 4': icoPhase4,
			'ICO Round 5': icoPhase5,
			'ICO Round 6': icoPhase6,
			'Team Tokens': teamTokens,
			Founders: founder,
			'Aviles Familiy': avilesFamily,
			'Influencers/Bounty': influencersBounty,
			'Lending Program': lendingProgram,
			'~Misc/Legal': legal,
			'Reserve for DEX & CEX Liquidity': reserveForDEXCEX,
			'Staking Rewards': stakingReward,
			Reserves: reserves,
		};
	} catch (error) {
		throw error;
	}
};
