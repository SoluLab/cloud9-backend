import dotenv from 'dotenv';

dotenv.config();
export default {
	nodeEnv: process.env.NODE_ENV,
	port: process.env.PORT,
	jwtSecret: process.env.JWT_SECRET,
	jetExpiresIn: process.env.JWT_EXPIRES_IN,
	stripeSecretKey: process.env.STRIPE_SECRET_KEY,
	apiVersionUrl: '/api/v1',
	db: {
		str:
			process.env.NODE_ENV === 'production'
				? process.env.CLOUD_MONGO_STRING
				: process.env.CLOUD_MONGO_STRING,
		options: {
			auto_reconnect: true,
			poolSize: 200,
			useNewUrlParser: true,
			readPreference: 'primaryPreferred',
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		},
	},
	adminCreds: {
		adminEmail: process.env.ADMIN_EMAIL,
		adminPassword: process.env.ADMIN_PASSWORD,
		adminName: process.env.ADMIN_NAME,
	},
	alchemyUrl: process.env.ALCHEMY_URL,
	gasPriceEstimateUrl: process.env.MATIC_GAS_STATION,
	etherscanApiKey: process.env.ETHER_SCAN_API_KEY,
	contracts: {
		tokenContract: process.env.CLOUD9_TOKEN_CONTRACT_ADDRESS,
		icoContract: process.env.CLOUD9_ICO_CONTRACT_ADDRESS,
		tokenHolderAccount: process.env.TOKEN_HOLDER_ACCOUNT,
	},
	contractAccounts: {
		deploymentAddress: process.env.DEPLOYMENT_ADDRESS,
		deploymentPrivateKey: process.env.DEPLOYMENT_PRIVATE_KEY,
	},
	getTransactionAPI: {
		endpoint: process.env.POLYGON_API_ENDPOINT,
		module: 'account',
		action: 'tokentx',
		startblock: '0',
		endblock: '99999999',
		page: '1',
		offset: '10000',
		sort: 'desc',
	},
	awsS3: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		bucketName: process.env.AWS_BUCKET_NAME,
	},
	sendGrid:{
		apiKey:  process.env.SENDGRID_API_KEY,
		sender:  process.env.SENDGRID_SENDER_EMAIL
	}
};
