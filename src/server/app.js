import Hapi from '@hapi/hapi';
import indexRoutes from './routes/index';

const routes = [].concat(indexRoutes);

function validate() {
	return { isValid: true };
}

const init = async () => {
	const server = Hapi.server({
		port: 3000,
		host: 'localhost',
	});

	await server.register(require('hapi-auth-jwt2'));

	server.auth.strategy('token', 'jwt', {
		key: 'SomeSecretKey',
		validate,
	});

	server.auth.default('token');

	server.route(routes);

	await server.start();
	console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', err => {
	console.log(err);
	process.exit(1);
});

init();
