// Index controller - puts all the controllers together
"use strict"

const express = require("express")
const router = express.Router()

router.get("/", function(req, res) {
	var db = req.app.get("db")
	db.Mod.findAll({
		limit: 10,
		include: [ db.User ]
	}).then(function(mods) {
		res.render("index", {
			title: "Welcome",
			mods: mods.map(db.convertRowToMod)
		})
	})
})

router.use(require("./mods"))

module.exports = router
