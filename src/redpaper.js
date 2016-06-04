#!/usr/bin/env node

import request from 'request';
import fs from 'fs';
// import program from 'commander';
// import json from 'json-file';
import path from 'path';
import del from 'del';
// import { getAccessToken } from './access_token';
import wallpaper from 'wallpaper';
import snoowrap from 'snoowrap';

var download_path = path.join(__dirname, '..', 'downloads');

json.spaces = 2;
const r = new snoowrap(require('../access.json'));

var sub = process.argv[3] || 'otters';
console.log('getting images from /r/'+sub);
r.get_subreddit(sub).get_hot({ limit: 10 }).then(getWallpaper);

function getWallpaper(posts) {
	for (var post of posts) {
		if ('url' in post) {
			// del('downloads/*').then(() => {
				downloadImage(post).then((fileURI) => {
					// console.log(`file "${fileURI}" has been saved.`);
					setWallpaper(fileURI);
				});
			// });
			break;
		}
	}
}

function setWallpaper(image) {
	wallpaper.get().then((current) => {
		console.log('Original:', current);
		wallpaper.set(image);
	});
	// wallpaper.set(image);
}

function downloadImage(post) {
	return new Promise((fulfill, reject) => {
		if (!('url' in post)) {
			reject('no url in post');
			return;
		}
		let image_url = post.url;
		let imgur_id = getImgurID(image_url);
		if (!(imgur_id)) {
			reject('no imgur id');
			return;
		}
		getImage(imgur_id).then((imgur_obj) => {
			if (imgur_obj.isAnimated) {
				reject('animated');
				return;
			}
			// console.log(imgur_obj);
			let nameArr = imgur_obj.link.split('/');
			let fileName = nameArr[nameArr.length - 1];
			let fileURI = path.join(download_path, fileName);
			// console.log(imgur_obj.link);
			// console.log(fileURI);
			request(imgur_obj.link).pipe(fs.createWriteStream(fileURI)).on('close', () => fulfill(fileURI));
		});
	});
}

function getImgurID(url) {
	var regex = /http:\/\/(?:i\.){0,1}imgur\.com\/([\w\d]+)(?:\.\w{0,3}){0,1}/g;
	var match = regex.exec(url);
	if (match && 1 in match) {
		return match[1];
	} else {
		return null;
	}
}

function getImage(imgur_id) {
	return new Promise((fulfill, reject) => {
		var client_id = "95aff5d1b3de7e5";
		var client_secret = "136cbb40c99dd4cd1dcd547760d6529f2d1df52a";
		var req_opts = {
			url: `https://api.imgur.com/3/image/${imgur_id}`,
			headers: {
				"Authorization": `Client-ID ${client_id}`
			}
		};
		request(req_opts, (err, res, body) => {
			if (err) reject(err);
			body = JSON.parse(body);
			if ('data' in body) {
				if ('error' in body.data) {
					reject(body.data.error);
					return;
				}
				fulfill(body.data);
			}
		});
	});
}