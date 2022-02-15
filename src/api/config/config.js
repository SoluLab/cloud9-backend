import dotenv from 'dotenv';

dotenv.config();
export default {
	nodeEnv: process.env.NODE_ENV,
	port: process.env.PORT,
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
	alchemyUrl: process.env.ALCHEMY_URL,
	gasPriceEstimateUrl: process.env.MATIC_GAS_STATION,
	etherscanApiKey: process.env.ETHER_SCAN_API_KEY,
	contracts: {
		tokenContract: process.env.CLOUD9_TOKEN_CONTRACT_ADDRESS,
		icoContract: process.env.CLOUD9_ICO_CONTRACT_ADDRESS,
	},
	contractAccounts: {
		deploymentAddress: process.env.DEPLOYMENT_ADDRESS,
		deploymentPrivateKey: process.env.DEPLOYMENT_PRIVATE_KEY,
	},
};
