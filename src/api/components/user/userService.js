import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Stripe from 'stripe';
import Web3 from 'web3';
import CloudNineICO from '../../../../artifacts/contracts/CloudNineICO.sol/CloudNineICO.json';
import Common from '@ethereumjs/common';
import Tx from '@ethereumjs/tx';
import User from './userModel.js';
import axios from 'axios';
import { alchemyUrl, contracts } from '../../config/config.js';
import geoip from 'geoip-lite';

const web3 = new Web3(new Web3.providers.HttpProvider(alchemyUrl));
const contract = new web3.eth.Contract(CloudNineICO.abi, contracts.icoContract);

const hashPassword = async (password) => {
	password = await bcrypt.hash(password, 12);
	return password;
};

export const createUser = async (data) => {
	const { email } = data;
	let { password } = data;
	const user = await User.findOne({ email });
	if (user) return { err_msg: 'User already exists', statusCode: 201 };
	password = await hashPassword(password);

	const newUser = await User.create({
		email,
		password,
	});
	if (!newUser)
		return {
			err_msg: 'Something went wrong please try again',
			statusCode: 400,
		};
	return newUser;
};

export const getUser = async (id) => {
	const user = await User.findById(id);
	return user;
};

export const updateUser = async (id, body) => {
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
};

export const login = async (body, clientIp) => {
	const ip = clientIp.split(':').pop();
	const location = geoip.lookup(ip);
	const loginData = {
		ip,
		region: location?.country,
	};
	const { email, password } = body;
	let user = await User.findOne({ email }, 'loginHistory email').select(
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
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRES_IN,
		}
	);

	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
	loginData.status = 'success';
	user.loginHistory.unshift(loginData);
	user.save();
	user = { email: user.email, _id: user._id };
	return { token, cookieOptions, user };
};

export const loggedIn = async (token) => {
	// verify token
	const verifiedToken = await promisify(jwt.verify)(
		token,
		process.env.JWT_SECRET
	);

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
		return { err_msg: 'Password changed please login again', statusCode: 401 };

	return user;
};

export const saveWalletAddress = async (email, body) => {
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
};

export const checkout = async (data) => {
	const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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
};

export const transactions = async (address) => {
	const transactions = await axios.get(
		`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.ETHER_SCAN_API_KEY}`
	);
	if (transactions) return transactions.data;
	return;
};

/*
export const walletBalance = async (id) => {
	let balance = await web3.eth.getBalance(
		'0x7a500E03A26926963c6111A02614481B297008D0'
	);
	balance = web3.utils.fromWei(balance, 'ether');
};
 */

export const loginHistory = async (id) => {
	const user = await User.findById(id, 'loginHistory').lean();
	if (!user) return;
	if (!user.loginHistory) return { loginHistory: [] };
	user.loginHistory.forEach((el) => {
		const date = new Date(el.date);
		el.date = date.toDateString();
		el.time = date.toTimeString();
	});
	return { loginHistory: user.loginHistory };
};

export const sendTokensToUser = async (recipient, amount) => {
	try {
		// recipient - walletaddress
		// amount - 5/2 * 10^18
		// 0xbe862AD9AbFe6f22BCb087716c7D89a26051f74C - contract deployment address
		console.log('Inside sendTokenToUser Service');
		const nonce = await web3.eth.getTransactionCount(
			'0xbe862AD9AbFe6f22BCb087716c7D89a26051f74C',
			'pending'
		);
		const gasPriceEstimate = await axios.get(
			'https://gasstation-mainnet.matic.network/'
		);
		const txData = {
			nonce: web3.utils.toHex(nonce),
			gasPrice: web3.utils.toHex(
				web3.utils.toWei(`${gasPriceEstimate.data.fast}`, 'Gwei')
			),
			gasLimit: web3.utils.toHex('3000000'),
			from: '0xbe862AD9AbFe6f22BCb087716c7D89a26051f74C',
			to: '0x406e5ff58036eee55e9c11a9927943130350d3ac', // ico contract address
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
			'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', // 74c private key
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
