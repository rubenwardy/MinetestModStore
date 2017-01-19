"use strict"

var request = require("request")
var API_URL = "http://localhost:8080"

class FarmerAPI {
	getWork() {
		return new Promise(function(resolve, reject) {
			request.get({
				url: API_URL + '/workers/get-work',
				qs: {
					token: "foobar"
				},
				json: true,
				// auth: {
				// 	username: me.username,
				// 	password: me.password,
				// 	sendImmediately: true
				// }
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					resolve(body.work)
				} else {
					reject(error)
				}
			})
		})
	}
}

module.exports = FarmerAPI
