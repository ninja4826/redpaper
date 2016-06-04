import yargs from 'yargs';
import * as auth from './auth';
import * as config from './config';

const argv = yargs.usage('Usage: $0 <command> [options]')
	.command(auth)
	.command(config)
	.demand(1)
	.example('$0 auth', 'Give access to the application')
	.help('h')
	.alias('h', 'help')
	// .help()
	.argv;