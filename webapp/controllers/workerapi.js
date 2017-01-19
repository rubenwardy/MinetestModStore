"use strict"

const express = require("express")
const router = express.Router()

router.get("/get-work", function(req, res) {
	var worker_token = req.query.token
	var db = req.app.get("db")
	db.Worker.findOne({
		where: {
			token: worker_token
		}
	}).then(function(worker) {
		if (worker) {
			db.Work.findAll({
				limit: 1,
				where: {
					workerId: null
				}
			}).then(function(jobs) {
				if (jobs && jobs.length == 1) {
					var job = jobs[0]
					job.workerId = worker.id
					job.save()
					res.send({
						work: {
							author: job.author,
							basename: job.basename,
							type: job.work_type
						}
					})
				} else {
					res.send({})
				}
			})
		} else {
			res.status(401).status("Unauthorized")
		}
	})
})

module.exports = router
