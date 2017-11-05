"use strict";
const config = require("../config");
let models = [];

module.exports = (app) => {
	for(let model of config["model"]) {
		models[model["model_name"]] = require(model["file"]);
	}

	app.set("model", models);
}