"use strict";

const mongo_client = require("mongodb").MongoClient;
const config = require("../config");

module.exports = async() => {
    return new Promise((resolve, reject) => {
        mongo_client.connect(config.mongodb, (err, db) => {
            if(err) reject(err);
            else resolve(db);
        })
    });
}