import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Stripe from 'stripe';
import Web3 from 'web3';
import CloudNineICO from '../../../../artifacts/contracts/CloudNineICOFlat.sol/CloudNineICO.json';
import CloudNineToken from '../../../../artifacts/contracts/CloudNine.sol/ERC20.json';
import Common from '@ethereumjs/common';
import Tx from '@ethereumjs/tx';
import User from './userModel.js';
import PaymentReceipt from './paymentReceiptModel.js';
import axios from 'axios';
import { default as config } from '../../config/config.js';
import geoip from 'geoip-lite';
import logger from '../../config/logger.js';
import Aws from 'aws-sdk';
import { sendMail } from '../../helpers/sendEmail.js';

const web3 = new Web3(new Web3.providers.HttpProvider(config.alchemyUrl));
const contract = new web3.eth.Contract(
	CloudNineICO.abi,
	config.contracts.icoContract
);
const tokenContract = new web3.eth.Contract(
	CloudNineToken.abi,
	config.contracts.tokenContract
);

const stripe = Stripe(config.stripeSecretKey);

export const CurrencyDenomination = {
	usd: 100,
	inr: 100,
};

const hashPassword = async (password) => {
	password = await bcrypt.hash(password, 12);
	return password;
};

export const signUpService = async (data) => {
	try {
		const { email, firstName, lastName, companyName } = data;
		let { password } = data;
		const user = await User.findOne({ email });
		if (user) return { err_msg: 'User already exists', statusCode: 201 };
		password = await hashPassword(password);

		const newUser = await User.create({
			email,
			password,
			firstName,
			lastName,
			companyName,
		});
		if (!newUser)
			return {
				err_msg: 'Something went wrong please try again',
				statusCode: 400,
			};
		return {
			_id: newUser._id,
			email: newUser.email,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			companyName: newUser.companyName,
		};
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
		let user = await User.findOne(
			{ email },
			'loginHistory email firstName lastName isAdmin'
		).select('+password');
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
			{ id: user._id, email: user.email, isAdmin: user.isAdmin },
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
		user = {
			email: user.email,
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			isAdmin: user.isAdmin,
		};
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
		const { walletAddress, amount: _amount, paymentMethodType } = data;
		const amount = _amount * 100;

		const currency = 'usd';

		// eslint-disable-next-line camelcase
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency,
			payment_method_types: [paymentMethodType],
			description: 'Cloud9',
		});

		const paymentReceipt = new PaymentReceipt({
			paymentIntentId: paymentIntent.id,
			amount: _amount, // Should be saving amount in standard denomination.
			currency,
			paymentMethodType,
			walletAddress,
		});

		// Save the payment receipt document. This payment has not been confirmed yet.
		await paymentReceipt.save();

		// eslint-disable-next-line camelcase
		return paymentIntent.client_secret;
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

export const webhookService = async (rawBody, stripeSignature) => {
	// Retrieve the event by verifying the signature using the raw body and secret.
	try {
		let event;
		try {
			event = stripe.webhooks.constructEvent(
				rawBody,
				stripeSignature,
				config.stripeWebhookSecret
			);
		} catch (err) {
			// Return an error object on failed verification.
			return { error: 'Webhook signature verification failed.' };
		}

		// Extract the data from the event.
		const data = event.data;
		const eventType = event.type;

		let paymentIntent = null;

		if (eventType === 'payment_intent.succeeded') {
			// Cast the event into a PaymentIntent to make use of the types.
			paymentIntent = data.object;
		} else if (eventType === 'payment_intent.payment_failed') {
			// Cast the event into a PaymentIntent to make use of the types.
			paymentIntent = data.object;
		}

		// Return success and do nothing if paymentIntent is null
		if (paymentIntent === null) {
			return {};
		}

		// Return bad request error if an error occurred in webhook verification.
		if (paymentIntent?.error) {
			return { error: paymentIntent.error };
		}

		const paymentReceipt = await PaymentReceipt.findOne({
			paymentIntentId: paymentIntent.id,
		});

		if (!paymentReceipt) {
			return { error: 'PaymentReceipt not found.' };
		}

		paymentReceipt.received =
			paymentIntent.status === 'succeeded' ? true : false;
		const balanceTransactionId =
			paymentIntent.charges.data[0].balance_transaction;
		const balanceTransaction = await stripe.balanceTransactions.retrieve(
			balanceTransactionId
		);
		paymentReceipt.amount =
			balanceTransaction.net !== undefined
				? balanceTransaction.net /
				  CurrencyDenomination[balanceTransaction.currency]
				: paymentReceipt.amount;

		// Save the payment receipt document. This payment has not been confirmed yet.
		await paymentReceipt.save();

		if (paymentReceipt.received) {
			await sendTokensToUserService(
				paymentReceipt.walletAddress,
				paymentReceipt.amount
			);
		}

		return {};
	} catch (error) {
		throw error;
	}
};

export const sendTokensToUserService = async (recipient, amount) => {
	try {
		logger.info('Inside sendTokenToUser Service');
		const phaseValue = await contract.methods.rate().call();
		const calculatedValue = (amount * phaseValue) / 2;
		const amountToBeTransferred = web3.utils.toWei(
			calculatedValue.toString(),
			'ether'
		);
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
				.sendTokens(recipient, web3.utils.toBN(amountToBeTransferred))
				.encodeABI(),
		};

		const common = Common.default.custom({
			name: 'matic',
			networkId: 137,
			chainId: 137,
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

export const uploadProfilePicService = async (file, user) => {
	// Create s3 instance
	const s3 = new Aws.S3({
		accessKeyId: config.awsS3.accessKeyId,
		secretAccessKey: config.awsS3.secretAccessKey,
	});

	const params = {
		Bucket: config.awsS3.bucketName,
		Key: `${user.userName}.jpeg`,
		Body: file.buffer,
		ACL: 'public-read-write',
		ContentType: 'image/jpeg',
	};

	// Upload image with s3
	s3.upload(params, async (err, data) => {
		if (data.Location) {
			await User.findByIdAndUpdate(user._id, {
				profilePic: data.Location,
			});
		}
	});
	return { msg: 'Image uploaded successfully' };
};

export const getTokenSaleProcessService = async () => {
	try {
		logger.info('Inside getTokenSaleProcessService Service');
		const icoTotalSupply = 3600000000;
		const decimals = await tokenContract.methods.decimals().call();
		const holderAvailableBalance = await tokenContract.methods
			.balanceOf(config.contracts.tokenHolderAccount)
			.call();

		const holderAvailableBalanceInDecimal =
			holderAvailableBalance / 10 ** decimals;
		const holderSpentBalance = icoTotalSupply - holderAvailableBalanceInDecimal;

		return {
			'Total ICO Supply': icoTotalSupply,
			'Available Balance': Number(holderAvailableBalanceInDecimal.toFixed(4)),
			'Amount Spent': Number(holderSpentBalance.toFixed(4)),
		};
	} catch (error) {
		throw error;
	}
};

export const forgotPasswordService = async (email) => {
	try {
		logger.info('Inside forgotPassword Service');
		let user = await User.findOne({ email }, 'email firstName lastName');
		if (!user)
			return {
				err_msg: `User doesn't exist with this email please signUp`,
				statusCode: 401,
			};
		const token = jwt.sign(
			{ id: user._id, email: user.email },
			config.jwtSecret,
			{
				expiresIn: 30 * 60 * 1000,
			}
		);
		const resetLink = `${config.passwordResetURL}?token=${token}`;
		const data = await sendMail(email, {
			subject: 'Reset Password',
			html: `
					<!doctype html>
					<html lang="en-US">

					<head>
							<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
							<title>Reset Password Email Template</title>
							<meta name="description" content="Reset Password Email Template.">
							<style type="text/css">
									a:hover {text-decoration: underline !important;}
							</style>
					</head>

					<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
							<!--100% body table-->
							<table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
									style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
									<tr>
											<td>
													<table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
															align="center" cellpadding="0" cellspacing="0">
															<tr>
																	<td style="height:80px;">&nbsp;</td>
															</tr>
															<tr>
																	<td style="height:20px;">&nbsp;</td>
															</tr>
															<tr>
																	<td>
																			<table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
																					style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
																					<tr>
																							<td style="height:40px;">&nbsp;</td>
																					</tr>
																					<tr>
																							<td style="padding:0 35px;">
																									<h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
																											requested to reset your password</h1>
																									<span
																											style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
																									<p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
																											A unique link to reset your
																											password has been generated for you. To reset your password, click the
																											following link and follow the instructions.
																									</p>
																									<a href="${resetLink}"
																											style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
																											Password</a>
																							</td>
																					</tr>
																					<tr>
																							<td style="height:40px;">&nbsp;</td>
																					</tr>
																			</table>
																	</td>
															<tr>
																	<td style="height:20px;">&nbsp;</td>
															</tr>
															<tr>
																	<td style="text-align:center;">
																			<p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.cloud9.cool </strong></p>
																	</td>
															</tr>
															<tr>
																	<td style="height:80px;">&nbsp;</td>
															</tr>
													</table>
											</td>
									</tr>
							</table>
							<!--/100% body table-->
					</body>

					</html>`,
		});
		if (data && data[0].statusCode === 202) return { email };
	} catch (error) {
		throw error;
	}
};

export const resetPasswordService = async (token, newPassword) => {
	try {
		const verifiedToken = await promisify(jwt.verify)(token, config.jwtSecret);
		const user = await User.findOne({ email: verifiedToken.email }).select(
			'+password'
		);
		user.password = await hashPassword(newPassword);
		const data = await user.save();
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
export const getStatisticsService = async () => {
	try {
		logger.info('Inside getStatisticsService Service');
		const icoTotalSupply = 3600000000;
		const phaseValue = await contract.methods.rate().call();
		const holderAvailableBalance = await tokenContract.methods
			.balanceOf(config.contracts.tokenHolderAccount)
			.call();
		const decimals = await tokenContract.methods.decimals().call();

		const holderAvailableBalanceInDecimal =
			holderAvailableBalance / 10 ** decimals;
		const holderSpentBalance = icoTotalSupply - holderAvailableBalanceInDecimal;

		const soldPercentage = (
			(holderSpentBalance / icoTotalSupply) *
			100
		).toFixed(4);

		return {
			targetCap: icoTotalSupply,
			sold: Number(holderSpentBalance.toFixed(4)),
			phaseValue: phaseValue,
			percentage: soldPercentage,
			converstionRate: `1 MATIC = $2 = ${phaseValue} C9`,
		};
	} catch (error) {
		throw error;
	}
};
