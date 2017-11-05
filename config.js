"use strict";
const passport = require("passport");
const path = require("path");

// test configuration
// node.js v9.0.0, mongodb 3.2.11

module.exports = {
	port: 80,
	mongodb: "몽고 URI",
	collections: {
		user: "user",
		trade: "trade"
	},
	secret_jwt_key: "JWT 토큰 키",
	facebook: {
		clientID: "페이스북 앱 아이디",
		clientSecret: "페이스북 앱 비밀키",
		profileFields: ["id", "displayName", "photos"]
	},
	router: [
		{file: "./user_router", method: "post", path: "/user/register", exec: "register", auth: false},
		{file: "./user_router", method: "post", path: "/user/login", exec: "login", auth: false},
		{file: "./user_router", method: "post", path: "/user/authenticate", exec: "authenticate", auth: false},
		{file: "./trade_router", method: "post", path: "/trade/create", exec: "trade_create", auth: true}
	],
	model: [
		{file: "./user_model", model_name: "user"},
		{file: "./trade_model", model_name: "trade"}
	],
	upload_dir: path.join(__dirname, "/uploads"),
	upload_extension: [".jpg", ".bmp", ".svg", ".png", ".gif"],
	upload_max_size: 1000000 * 50
}