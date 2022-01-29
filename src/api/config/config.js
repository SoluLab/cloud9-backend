import dotenv from 'dotenv';

dotenv.config();
export default {
	apiVersionUrl: '/api/v1',
	db: {
		str:
			process.env.NODE_ENV === 'production'
				? process.env.SPOOKY_MONGO_STRING
				: process.env.SPOOKY_MONGO_STRING,
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
};
