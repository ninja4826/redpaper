import rp from 'request-promise';
import request from 'request';
import fs from 'fs';
import path from 'path';
import del from 'del';
import wallpaper from 'wallpaper';
import snoowrap from 'snoowrap';

export const command = 'run';
export const description = 'Changes the desktop wallpaper based on your current configuration';
export const builder = (yargs) => {
	return yargs.options({
		'y': {
			desc: 'Runs without user confirmation',
			boolean: true
		}
	});
};

export const handler = (argv) => {
	
};