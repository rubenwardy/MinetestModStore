// Index controller - puts all the controllers together
"use strict";

const express = require("express")
const router = express.Router()

router.get("/", function(req, res) {
	res.render("index", {
		title: "Mod Developer Panel",
		mods: []
	})
})

module.exports = router
