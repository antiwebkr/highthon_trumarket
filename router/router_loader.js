"use strict";
const express = require("express");
const config = require("../config");

module.exports = (app) => {
	let router = express.Router();

	for(let route_info of config["router"]) {
		switch(route_info["method"]) {
			case "get":
				router.route(route_info["path"]).get(require(route_info["file"])[route_info["exec"]]);
				break;
			case "post":
				router.route(route_info["path"]).post(require(route_info["file"])[route_info["exec"]]);
				break;
			case "put":
				router.route(route_info["path"]).put(require(route_info["file"])[route_info["exec"]]);
				break;
			case "delete":
				router.route(route_info["path"]).delete(require(route_info["file"])[route_info["exec"]]);
				break;
		}
	}
	app.use("/", router);
}