"use strict"

require("process").chdir(__dirname)

const FarmerAPI = require("./farmerapi")
const api = new FarmerAPI()

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

	job().then(function(res) {
		console.log("Job finished!")
		console.log(res)
		setTimeout(checkForJobs, 5000)
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
		setTimeout(checkForJobs, 5000)
	})
}

setTimeout(checkForJobs, 5000)
