"use strict"

const express = require("express")
const router = express.Router()

router.get("/job", function(req, res) {
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
				},
				include: [{
					model: db.Mod,
					include: [db.User]
				}]
			}).then(function(jobs) {
				if (jobs && jobs.length == 1) {
					var job = jobs[0]
					// job.workerId = worker.id
					// job.save()

					var mod = db.convertRowToMod(job.mod)
					res.send({
						work: {
							type: job.work_type,
							mod: mod.toPlainDictionary()
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

router.post("/job", function(req, res) {
	console.log(req.body)
	res.send("OK")
})

module.exports = router
