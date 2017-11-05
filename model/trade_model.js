"use strict";
const database = require("./database");
const config = require("../config");

module.exports = new class {
	constructor() {
		database()
			.then((db) => {
				this.db = db;
			})
			.catch((err) => console.error(err));
	}
	trade_insert(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).insert(data, (err, result) => {
				if(err) reject(err);
				else resolve(result);
			});
		});
	}
}