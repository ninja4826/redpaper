import jsonfile from 'jsonfile';
import mkdirp from 'mkdirp';
import path from 'path';
import fs from 'fs';

export const command = 'config [key]';
export const describe = 'Sets or gets configuration';
export const builder = (yargs) => {
	return yargs.options({
		set: {
			alias: 's',
			desc: 'Sets the configuration key to the specified value',
			requiresArg: true
		}
	});
}

// export const handler = (argv) => {
// 	// console.log(argv);
// 	let filePath = path.join(__dirname, '..', 'config.json');
// 	var configObj = jsonfile.readFileSync(filePath);
// 	var valid_configs = {
// 		subreddit: 'The subreddit to pull images from. [REQUIRED]',
// 		regex: 'A regular expression to search through posts. [OPTIONAL]',
// 		limit: 'Number of posts to pull [DEFAULT = 10]'
// 	};
// 	if ('key' in argv && argv.key && argv.key !== undefined) {
// 		if (argv.key in valid_configs) {
// 			if ('set' in argv && argv.set && argv.set !== undefined) {
// 				// console.log(`Setting ${argv.key} to ${argv.set}.`);
// 				configObj[argv.key] = argv.set;
// 				jsonfile.writeFileSync(filePath, configObj, { spaces: 2 });
// 			}
// 			console.log(`config.${argv.key} => ${JSON.stringify(configObj[argv.key])}`);
// 		} else {
// 			console.log(`"${argv.key}" is not a valid configuration option.\n`);
// 			for (var key in valid_configs) {
// 				console.log(`config.${key}\t${valid_configs[key]}`);
// 			}
// 		}
// 	} else {
// 		console.log('Current configuration:\n');
// 		for (var key of Object.keys(valid_configs).sort()) {
// 			console.log(`config.${key} => ${JSON.stringify(configObj[key])}`);
// 		}
// 	}
// };

export const handler = (argv) => {
	var config = new Config();
	if ('key' in argv && argv.key && argv.key !== undefined) {
		if (argv.key in config.validConfigs) {
			if ('set' in argv && argv.set && argv.set !== undefined) {
				config.setProp(argv.key, argv.set);
			}
			console.log(`config.${argv.key} => ${JSON.stringify(config.get(argv.key))}`);
		} else {
			console.log(`"${argv.key}" is not a valid configuration option.\n`);
			for (var key in config.validConfigs) {
				console.log(`config.${key}\t${config.validConfigs[key]}`);
			}
		}
	} else {
		console.log('Current configuration:\n');
		for (var key of Object.keys(config.validConfigs).sort()) {
			console.log(`config.${key} => ${JSON.stringify(config.get(key))}`);
		}
	}
};

let instance = null;

export class Config {
	constructor() {
		if (!instance) {
			instance = this;
		}
		var configDir = path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.redpaper');
		mkdirp.sync(path.join(configDir, 'downloads'));
		this.configPath = path.join(configDir, 'config.json');

		if (!path.existsSync(this.configPath)) {
			fs.writeFileSync(this.configPath, '{}', { encoding: 'utf8' });
		}

		this.validConfigs = {
			subreddit: 'The subreddit to pull images from. [REQUIRED]',
			regex: 'A regular expression to search through posts. [OPTIONAL]',
			limit: 'Number of posts to pull [DEFAULT = 10]'
		};
	}

	getProp(prop) {
		var confObj = jsonfile.readFileSync(this.configPath);
		if (prop in confObj) {
			return confObj[prop];
		}
		return null;
	}

	setProp(prop, val) {
		var confObj = jsonfile.readFileSync(this.configPath);
		if (prop in this.validConfigs) {
			confObj[prop] = val;
			jsonfile.writeFileSync(this.configPath, confObj, { spaces: 2 });
			return val;
		}
		return null;
	}

	getConfig() {
		return jsonfile.readFileSync(this.configPath);
	}
}