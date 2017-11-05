"use strict";
const formidable = require("formidable");

const trade_create = async(req, res) => {
	// 미구현
	const {user_id} = req.token;
	const {trade} = req.body;
	const model = req.app.get("model")["trade"];

	try {
		let trade_insert = await model.trade_insert(trade);

		if(!trade_insert) {
			res.sendStatus(403);
			return;
		}

		res.status(200).json(trade_insert);
		return;
	} catch(err) {
		console.error(err);
		res.sendStatus(500);
		return;
	}
}

module.exports.trade_create = trade_create;