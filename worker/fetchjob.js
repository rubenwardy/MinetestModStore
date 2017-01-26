"use strict"

const reposervers = require("./reposervers")

function run(data, settings) {
	return new Promise(function(resolve, reject) {
		var url
		if (data.repo && data.repo.url) {
			url = data.repo.url
		} else if (data.download && data.download.url) {
			url = data.download.url
		}

		const github = new reposervers.GithubRepoServer(settings.github_auth, settings.cache_dir)
		const repo = github.getRepoFromURL(url)
		if (repo) {
			Promise.all([
				github.getDescriptionFromRepo(repo),
				github.getDependsFromRepo(repo),
				github.getDownloadAndHash(repo),
			]).then(function(res) {
				if (res.length == 3) {
					resolve({
						description: res[0],
						depends: res[1],
						download: {
							url: res[2].link,
							size: -1
						},
						commit: res[2].commit
					})
				} else {
					reject()
				}
			}).catch(reject)
		} else {
			reject("unknown repo server")
		}
	})
}

module.exports = run
