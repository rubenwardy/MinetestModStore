"use strict"

require("process").chdir(__dirname)

const FarmerAPI = require("./farmerapi")
const api = new FarmerAPI()
const fs = require("fs")
const settings = JSON.parse(fs.readFileSync("settings.json", 'utf8'))

function startJob(data) {
	console.log("Starting job of type " + data.type)
	var job
	switch (data.type) {
		case "fetch":
			job = require("./fetchjob")
			break
		default:
			return null
	}

	job(data.mod, settings).then(function(res) {
		console.log("Job finished!")
		console.log(res)
		res.type = data.type
		api.sendResults(res).then(function() {
			setTimeout(checkForJobs, 5000)
		}).catch(function() {
			console.log("Failed to submit results!")
			console.log(e)
		})
	}).catch(function(e) {
		console.log("Job failed!")
		console.log(e)
	})
}

function checkForJobs(data) {
	console.log("Checking for jobs...")
	api.getWork().then(function(job) {
		if (job) {
			startJob(job)
		} else {
			console.log("No jobs available")
			setTimeout(checkForJobs, 5000)
		}
	}).catch(function(e) {
		console.log("Error whilst checking for jobs")
		console.log(e)
		setTimeout(checkForJobs, 5000)
	})
}

setTimeout(checkForJobs, 100)
