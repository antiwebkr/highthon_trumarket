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
	async register(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).insert({
				user_email: data.user_email,
				user_password: data.user_password,
				user_nick: data.user_nick,
				user_phone: data.user_phone,
				reg_type: "native"
			}, (err, result) => {
				if(err) reject(err);
				else resolve(result);
			});
		});
	}
	async user_duplicate(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).find({
				$or: [
					{user_email: data.user_email},
					{user_phone: data.user_phone},
					{user_nick: data.user_nick}
				]
			}).count((err, count) => {
				if(err) reject(err);
				else resolve(count);
			});
		});
	}
	async fb_user_duplicate(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).find({user_id: data.user_id}).count((err, count) => {
				if(err) reject(err);
				else resolve(count);
			});
		});
	}
	async fb_register(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).insert({
				user_id: data.user_id,
				user_nick: data.user_nick,
				user_profile: data.user_profile,
				user_token: data.user_token,
				reg_type: "fb"
			}, (err, result) => {
				if(err) reject(err);
				else resolve(result);
			});
		});
	}
	async fb_user_schema(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).findOne({
				user_id: data.user_id
			}, (err, user_data) => {
				if(err) reject(err);
				else resolve(user_data);
			});
		});
	}
	async user_schema(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).findOne({
				user_email: data.user_email
			}, (err, user_data) => {
				if(err) reject(err);
				else resolve(user_data);
			});
		});
	}
	async login(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).find({
				$and: [
					{user_email: data.user_email},
					{user_password: data.user_password},
				]
			}).count((err, count) => {
				if(err) reject(err);
				else resolve(count);
			});
		});
	}
	async _id_user_schema(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).findOne({
				_id: data._id
			}, (err, user_data) => {
				if(err) reject(err);
				else resolve(user_data);
			})
		});
	}
	async user_profile_update(data) {
		return new Promise((resolve, reject) => {
			this.db.collection(config["collections"]["user"]).update({_id: data.user_id}, {$set: {user_profile: data.path}}, (err, result) => {
				if(err) reject(err);
				else resolve(result);
			});
		});
	}
}