"use strict";
const jwt = require("json-web-token");
const {ObjectId} = require("mongodb");
const fs = require("fs");
const path = require("path");
const mv = require("mv");
const formidable = require("formidable");
const util = require("../lib/util");
const config = require("../config");

const register = async(req, res) => {
	/*
		POST /user/register
		query param: 
			user_email: 유저 이메일,
			user_password: 유저 비밀번호,
			user_nick: 유저 닉네임,
			user_phone: 유저 핸드폰 번호
		error code:
			200: 성공
			400: 파라미터가 올바르지 않음 (이메일 형식 에러 포함)
			403: 유저 중복 || 유저 가입 에러 || 유저 정보 못가져옴
			500: 알 수 없는 서버 에러
	*/
	const model = req.app.get("model")["user"];
	let {user_email, user_password, user_nick, user_phone} = req.body;
	
	if(!user_email || !user_password || !user_nick || !user_phone ) {
		res.sendStatus(400);
		return;
	}

	try {
		let user_duplicate = await model.user_duplicate({
			user_email: user_email,
			user_nick: user_nick,
			user_phone: user_phone
		});

		if(user_duplicate) {
			res.sendStatus(403);
			return;
		}

		let register = await model.register({
			user_email: user_email,
			user_password: util.sha512(user_password),
			user_nick: user_nick,
			user_phone: user_phone
		});

		if(!register) {
			res.sendStatus(403);
			return;
		}

		let user_schema = await model.user_schema({
			user_email: user_email
		});

		if(!user_schema) {
			res.sendStatus(403);
			return;
		}

		let token = await jwt.encode(config.secret_jwt_key, {user_id: user_schema["_id"]}, 'HS512', (err, token) => new Promise((resolve) => resolve(token)));
		user_schema["user_token"] = token;

		res.status(200).json(user_schema);
		return;
	} catch(err) {
		console.error(err);
		res.sendStatus(500);
		return;
	}
}

const login = async(req, res) => {
	/*
		POST /user/login
		query param: 
			user_email: 유저 이메일,
			user_password: 유저 비밀번호,
		error code:
			200: 성공
			400: 파라미터가 올바르지 않음
			403: 로그인 실패 || 유저 정보 못가져옴
			500: 알 수 없는 서버 에러
	*/
	const model = req.app.get("model")["user"];
	let {user_email, user_password} = req.body;

	if(!user_email || !user_password) {
		res.sendStatus(400);
		return;
	}

	try {
		let login = await model.login({
			user_email: user_email,
			user_password: util.sha512(user_password)
		});

		if(!login) {
			res.sendStatus(403);
			return;
		}

		let user_schema = await model.user_schema({
			user_email: user_email
		});

		if(!user_schema) {
			res.sendStatus(403);
			return;
		}

		let token = await jwt.encode(config.secret_jwt_key, {user_id: user_schema["_id"]}, "HS512", (err, token) => new Promise((resolve) => resolve(token)));
		user_schema["user_token"] = token;

		res.status(200).json(user_schema);
		return;
	} catch(err) {
		console.error(err);
		res.sendStatus(500);
		return;
	}
}

const authenticate = async(req, res) => {
	/*
		POST /user/authenticate
		query param: 
			user_token: 유저 토큰
		error code:
			200: 성공
			400: 파라미터가 올바르지 않음
			403: 유저 정보 못가져옴
			405: 토큰이 올바르지 않음
	*/
	const model = req.app.get("model")["user"];
	let {user_token} = req.body;

	if(!user_token) {
		res.sendStatus(400);
		return;
	}

	let decode
	try {
		decode = await jwt.decode(config.secret_jwt_key, user_token, (err, payload, header) => new Promise((resolve) => resolve(payload)));

		let user_schema = await model._id_user_schema({
			_id: ObjectId(decode["user_id"])
		});

		if(!user_schema) {
			res.sendStatus(403);
			return;
		}

		let token = await jwt.encode(config.secret_jwt_key, {user_id: user_schema["_id"]}, "HS512", (err, token) => new Promise((resolve) => resolve(token)));
		user_schema["user_token"] = token;

		res.status(200).json(user_schema);
	} catch(err) {
		res.sendStatus(405);
		return;
	}
}

const change_profile_image = async(req, res) => {
	/*
		POST /user/profile
		header: 
			token: 유저 토큰
		query param:
			upload: 파일 데이터(이미지 파일만 허용)
		error code:
			200: 성공
			400: 파라미터가 올바르지 않음
			402: 파일 최대 업로드 사이즈(50MB)를 초과함
			403: 유저 프로필 변경 업데이트 에러 || 유저 정보 못가져옴
			405: 토큰이 올바르지 않음
	*/
	const model = req.app.get("model")["user"];
	let {user_id} = req.token;

	if(!user_id) {
		res.sendStatus(400);
		return;
	}

	try {
		const form = new formidable.IncomingForm();

		form.parse(req, async(err, fields, file) => {
			const upload_dir = config.upload_dir;
			const save_file = path.join(upload_dir, file.upload.name);

			if(config.upload_max_size <= file.upload.size) {
				res.sendStatus(402);
				return;
			}
			else if(config.upload_extension.indexOf(path.extname(file.upload.name).toLowerCase()) !== -1) {
				let file_upload = await new Promise((resolve) =>
					mv(file.upload.path, save_file, {mkdirp: true}, (err) => err ? resolve(null) : resolve(1))
				);

				if(file_upload) {
					let user_profile_update = await model.user_profile_update({
						user_id: ObjectId(user_id),
						path: file.upload.name
					})

					if(!user_profile_update) {
						res.sendStatus(403);
						return;
					}

					let user_schema = await model._id_user_schema({
						_id: ObjectId(user_id)
					});

					if(!user_schema) {
						res.sendStatus(403);
						return;
					}

					let token = await jwt.encode(config.secret_jwt_key, {user_id: user_schema["_id"]}, 'HS512', (err, token) => new Promise((resolve) => resolve(token)));
					user_schema["user_token"] = token;

					res.status(200).json(user_schema);
					return;
				}
				else {
					res.sendStatus(403);
				}
			}
		});

	} catch(err) {
		console.error(err);
		res.sendStatus(500);
		return;
	}
}


module.exports.register = register;
module.exports.login = login;
module.exports.authenticate = authenticate;
module.exports.change_profile_image = change_profile_image;