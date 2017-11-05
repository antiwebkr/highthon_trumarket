"use strict";
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const config = require("./config");
const router_loader = require("./router/router_loader");
const model_loader = require("./model/model_loader");
const facebook = require("./lib/facebook");
const passport = require("passport");
const token = require("./lib/token");
const 	path = require("path");

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, "uploads")));

app.use(token);

model_loader(app);
router_loader(app);

app.use(passport.initialize())
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

facebook(app);

app.listen(config.port, () => {
	console.log(`SERVER START ${config.port} LISTEN!`)
});