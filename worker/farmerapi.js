"use strict"

var request = require("request")

class FarmerAPI {
	constructor(url) {
		this.url = url
	}

	getWork() {
		return new Promise((resolve, reject) => {
			request.get({
				url: this.url + '/workers/job',
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
		return new Promise((resolve, reject) => {
			request.post({
				url: this.url + '/workers/job',
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
