// Index controller - puts all the controllers together
"use strict"

const express = require("express")
const router = express.Router()

router.get("/mods", function(req, res) {
	var db = req.app.get("db")
	db.Mod.findAll({
		limit: 10,
		include: [ db.User ]
	}).then(function(mods) {
		var mod_c = mods.map(db.convertRowToMod)
		switch (req.accepts("html", "json")) {
			case "html":
				res.render("index", {
					title: "Mod Search",
					mods: mod_c
				})
				break;
			case "json":
				res.send(mod_c.map((mod) => { return mod.toPlainDictionary() }))
				break;
			default:
				res.status(406).send("Not acceptable")
				break
		}
	})
})

router.get("/mod/:author/:modname", function(req, res) {
	var db = req.app.get("db")
	db.Mod.findOne({
		limit: 10,
		where: {
			basename: req.params.modname
		},
		include: [{
			model: db.User,
			where: { username: req.params.author }
		}, db.Work]
	}).then(function(mod) {
		if (mod) {
			var mod_c = db.convertRowToMod(mod)
			switch (req.accepts("html", "json")) {
				case "html":
					mod_c.works = mod.works
					res.render("mod", {
						title: mod.title,
						mod: mod_c
					})
					break
				case "json":
					res.send(mod_c.toPlainDictionary())
					break
				default:
					res.status(406).send("Not acceptable")
					break
			}
		} else {
			res.status(404).send("Not found")
		}
	})
})

module.exports = router
