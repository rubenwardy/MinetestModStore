"use strict"

var request = require("request")
var API_URL = "http://localhost:8080"

class FarmerAPI {
	getWork() {
		return new Promise(function(resolve, reject) {
			request.get({
				url: API_URL + '/workers/job',
				qs: {
					token: "foobar"
				},
				json: true
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					resolve(body.work)
				} else {
					reject(error)
				}
			})
		})
	}

	sendResults(results) {
		return new Promise(function(resolve, reject) {
			request.post({
				url: API_URL + '/workers/job',
				qs: {
					token: "foobar"
				},
				json: true,
				body: results
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					resolve(body)
				} else {
					reject(error)
				}
			})
		})
	}
}

module.exports = FarmerAPI
