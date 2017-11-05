"use strict";
const crypto = require("crypto");

const sha512 = (hash) => {
	return crypto.createHash("sha512").update(hash).digest("hex");
}

const route_replace = (route, path) => {
	let count = 0;
	let index = [];
	route = route.split('/');
	path = path.split('/');
	
	for(let i of route) {
		if(/(:)\w+/.test(i)) index.push(count);
		count += 1;
	}

	for(let i of index)
		route[i] = path[i];
	
	if(!index.length) return false;
	
	return route.join('/');
}


module.exports.sha512 = sha512;
module.exports.route_replace = route_replace;