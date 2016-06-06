import del from 'del';

export const command = 'clear';
export const description = 'Deletes all images that have been saved for wallpapers';
export const builder = (yargs) => {
	return yargs;
};
export const handler = (argv) => {
	del(path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.redpaper', 'downloads'));
};