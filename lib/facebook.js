"use strict";
const multer = require("multer");
const passport = require("passport");
const fb_token_strategy = require("passport-facebook-token");
const jwt = require("json-web-token");
const config = require("../config");

module.exports = (app) => {
	let filedisk = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, "uploads/");
		},
		filename: (req, file, cb) => {
			cb(null, file.originalname);
		}
	});

	let upload = multer({storage: filedisk});

	passport.use(new fb_token_strategy(config.facebook, async(access_token, refresh_token, profile, done) => {
		const model = require("../model/user_model");

		try {
			let user_dup = await model.fb_user_duplicate({
				user_id: profile["id"]
			});

			if(user_dup) {
				let user_schema = await model.fb_user_schema({
					user_id: profile["id"]
				});

				if(!user_schema) {
					done(err);
				}
				let token = await jwt.encode(config.secret_jwt_key, {user_id: user_schema["_id"]}, 'HS512', (err, token) => new Promise((resolve) => resolve(token)));
				user_schema["token"] = token;

				done(null, user_schema);
			}
			else {
				let register = await model.fb_register({
					user_id: profile["id"],
					user_nick: profile["displayName"],
					user_profile: profile["photos"][0]["value"]
				});

				if(!register) {
					done(new Error());
				}

				let user_schema = await model.fb_user_schema({
					user_id: profile["id"]
				});

				if(!user_schema) {
					done(new Error());
				}
				let token = await jwt.encode(config.secret_jwt_key, {user_id: user_schema["_id"]}, 'HS512', (err, token) => new Promise((resolve) => resolve(token)));
				user_schema["user_token"] = token;

				return done(null, user_schema);
			}
		} catch(err) {
			console.error(err);
			return done(new Error());
			return;
		}
	}));

	app.post("/user/facebook", passport.authenticate("facebook-token"), (req, res) => {
		/*
			POST /user/facebook
			query param: 
				access_token: 페이스북 액세스 토큰
			error code:
				200: 성공
				400: 파라미터가 올바르지 않음 (이메일 형식 에러 포함)
				403: 페북 패스포트에 뭔가 문제가 있음
				500: 알 수 없는 서버 에러
		*/
		if(req.err) {
			res.sendStatus(403);
			return;
		}
		else {
			res.status(200).json(req.user);
			return;
		}
	});
}