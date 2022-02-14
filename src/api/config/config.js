import dotenv from 'dotenv';

dotenv.config();
export default {
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
	contracts: {
		tokenContract: process.env.CLOUD9_TOKEN_CONTRACT_ADDRESS,
		icoContract: process.env.CLOUD9_ICO_CONTRACT_ADDRESS,
	},
};
