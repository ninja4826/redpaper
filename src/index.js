import yargs from 'yargs';
import * as run from './run';
import * as auth from './auth';
import * as config from './config';
import * as clear from './clear';

const argv = yargs.usage('Usage: $0 <command> [options]')
	.command(run)
	.command(auth)
	.command(config)
	.command(clear)
	.demand(1)
	.example('$0 auth', 'Give access to the application')
	.help('h')
	.alias('h', 'help')
	// .help()
	.argv;