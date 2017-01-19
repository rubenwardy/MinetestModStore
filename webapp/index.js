"use strict"

require("process").chdir(__dirname)

var app = require("express")()

// Support JSON and URL encoded bodies
var bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({	 // to support URL-encoded bodies
	extended: true
}))

// Caching for JSON APIs
var apicache = require("apicache").options({ debug: false }).middleware

// Support Liquid templating
var expressLiquid = require("express-liquid")
var options = {
	// read file handler, optional
	includeFile: function (filename, callback) {
		var fs = require("fs")
		fs.readFile(filename, "utf8", callback)
	},
	// the base context, optional
	context: expressLiquid.newContext(),
	// custom tags parser, optional
	customTags: {},
	// if an error occurred while rendering, show detail or not, default to false
	traceError: false
}
app.set("view engine", "liquid")
app.engine("liquid", expressLiquid(options))
app.use(expressLiquid.middleware)

// Database
const db = require("./models/database")
app.set("db", db)

// Controllers
app.use(require("./controllers"))

// Start server
app.listen(8080, "127.0.0.1", function () {
	console.log("Minetest Mod Database listening on port 8080!")
})
