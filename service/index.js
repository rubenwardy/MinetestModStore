"use strict"

require("process").chdir(__dirname)

const FarmerAPI = require("./farmerapi")
const api = new FarmerAPI()

api.getWork().then(function(r) {
	console.log("r: ")
	console.log(r);
}).catch(function(e) {
	console.log("e" + e)
})
