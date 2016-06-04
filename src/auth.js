import open from 'open';
import rq from 'request-promise';
import qs from 'querystring';
import crypto from 'crypto';
import util from 'util';
import http from 'http';
import url from 'url';
import jsonfile from 'jsonfile';
import path from 'path';

const baseUrl = 'https://www.reddit.com/api/v1/';
const request = rq.defaults({ json: true, baseUrl });
const port = 65010;
const expected_redirect_uri = `http://localhost:${port}/authorize_callback`;

const client_info = {
	"client_id": "9LWQCTOke1LCGQ",
	"client_secret": "jBogOi5FOTGfBSMqS6ZuL5xD6N4"
};

function getScopes() {
	return new Promise((fulfill, reject) => {
		request.get('scopes').then(scopes => {
			fulfill(Object.keys(scopes).sort());
		}).catch(err => reject(err));
	});
}

function getAuthURL(state, results) {
	// console.log('Getting scopes...');
	getScopes().then(scopes => {
		// console.log('Got scopes');
		var qs_obj = {
			client_id: results.client_id,
			response_type: 'code',
			state,
			redirect_uri: expected_redirect_uri,
			duration: results.duration,
			scope: scopes.join(' ')
		};
		open(`${baseUrl}authorize?${qs.stringify(qs_obj)}`);
		console.log(`\nHopefully your browser just opened. If it didn't, try going to this URL manually:\n\n${auth_url}\n`);
	});
}

function handleError(res, err, state, results) {
	console.error(err);
	res.writeHead(500, { 'Content-Type': 'text/html' });
	if (err.statusCode) {
		res.write(`An unknown error occured (status code: ${err.statusCode}). Details on the error have been logged below. `);
	}
	res.write(`Depending on the type of error, <a href=${getAuthURL(state, results)}>trying again</a> might help.`);
	res.write(`<pre><code>${util.inspect(err)}</code></pre>`);
	res.end();
}

function cbListen(state, results) {
	http.createServer((req, res) => {
		const query = url.parse(req.url, true).query;
		if (query.state !== state) {
			res.writeHead(401);
			res.end();
		} else if (query.code) {
			request.post({
				uri: 'access_token',
				auth: { user: results.client_id, pass: results.client_secret || ''},
				form: { grant_type: 'authorization_code', code: query.code, redirect_uri: expected_redirect_uri }
			}).then(token_info => {
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.write('Your token was retrieved successfully.');
				res.write(`<pre><code>${JSON.stringify(token_info, null, 4)}</code></pre>`);
				res.end();
				getTokenInfo(token_info);
				process.exit();
			}).catch(err => handleError(res, err, state, results));
		} else if (query.error === 'access_denied') {
			res.writeHead(400, { 'Content-Type': 'text/html' });
      res.write('In order to obtain a token, you will need to click "allow" at the reddit authentication screen.');
      res.write(`<br><br>To try again, click <a href=${getAuthURL(state, results)}>here</a>.`);
      res.end();
		} else {
			handleError(res, { statusCode: 400, statusMessage: 'Failed to parse response from reddit' }, state, results);
		}
	}).listen(port);
}

function openAuthPage(results) {
	const state = crypto.randomBytes(16).toString('base64');
	getAuthURL(state, results);
	cbListen(state, results);
}

function getTokenInfo(token_info) {
	var access_obj = {};
	Object.assign(access_obj, client_info, { user_agent: "redpaper", refresh_token: token_info.refresh_token });
	// console.log(access_obj);
	jsonfile.writeFileSync(path.join(__dirname, '..', 'access.json'), access_obj, { spaces: 2 });
}

function auth(temp) {
	var res_obj = {};
	var duration = temp ? 'temporary' : 'permanent';
	Object.assign(res_obj, client_info, { duration });
	// console.log('results:', res_obj);
	openAuthPage(res_obj);
}

export const command = 'auth';
export const describe = 'Authenticate this app with a reddit account.';
export const builder = (yargs) => {
	return yargs.options({
		temporary: {
			alias: 't',
			desc: 'Gives temporary authorization to the account. Usually permanent.',
			boolean: true
		}
	});
};

export const handler = (argv) => {
	auth(argv.temporary);
};