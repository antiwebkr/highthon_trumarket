"use strict";
const config = require("../config");
const jwt = require("json-web-token");

module.exports = async(req, res, next) => {
	if(req["headers"]["token"]) {
		let token = await jwt.decode(config.secret_jwt_key, req["headers"]["token"], (err, payload, header) => new Promise((resolve) => resolve(payload)));

		token ? req["token"] = token : req["token"] = null;
	}
	for(let route_info of config["router"]) {
		if((route_info["auth"] === true && (route_info["path"] === req["url"] || req["url"] === util.route_replace(route_info["path"], req["url"]) || route_info["path"] === req["url"].split('?')[0]) && req["method"] === route_info["method"].toUpperCase()) && !req["token"]) {
			res.sendStatus(405);
			return;
		}
		else if(route_info["path"] === req["url"]) {
			next();
			return;
		}
	}
	next();
}