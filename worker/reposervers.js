"esversion: 6";
"use strict"

class RepoServer {
	constructor(cachepath) {}

	saveCache() {}

	getServerName() {}

	// Returns tupple: user, repo. Returns immediately
	getRepoFromURL(url) {}

	connect() {}

	getRepoURL(repo) {}

	// Returns a promise which will give you a description on completion
	getDescriptionFromRepo(repo) {}

	// Returns a promise which will give you depends.txt on completion
	getDependsFromRepo(repo) {}

	// Returns a promise which will give you a tuple: download link and hash
	getDownloadAndHash(repo, branch) {}

	// Registers a on change listener
	registerListener(repo) {}
}

var fs = require('fs');
var Promise = require('bluebird');

class GithubRepoServer extends RepoServer {
	getServerName() {
		return "github.com"
	}

	constructor(github_auth, cachepath) {
		super();
		this.github = null;
		this.github_auth = github_auth;
		this.cachepath = cachepath
		this.cache = {};
		this.hits = 0;
		this.misses = 0;

		try {
			this.cache = JSON.parse(fs.readFileSync(this.cachepath, 'utf8'));
		} catch(e) {
			this.cache = {};
		}
	}

	saveCache() {
		console.log("Saving cache...");
		fs.writeFile(this.cachepath, JSON.stringify(this.cache));
	}

	connect() {
		var GitHubApi = require("github");
		this.github = new GitHubApi({
		    // optional
		    // debug: true,
		    protocol: "https",
		    host: "api.github.com", // should be api.github.com for GitHub
		    pathPrefix: "", // for some GHEs; none for GitHub
		    headers: {
		        "user-agent": "MtMods4Android Server" // GitHub is happy with a unique user agent
		    },
		    Promise: Promise,
		    followRedirects: true, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
		    timeout: 5000
		});

		this.github.authenticate({
		    type: "oauth",
		    token: this.github_auth
		});

		return true;
	}

	getRepoFromURL(link) {
		var re = /github.com\/([\w-]+)\/([\w-]+)/g;
		if (re) {
			var m = re.exec(link);
			if (m) {
				return {
					user: m[1],
					repo: m[2]
				};
			}
		} else {
			console.log("failed to compile");
		}
		return null;
	}

	getRepoURL(repo) {
		return "https://github.com/" + repo.user + "/" + repo.repo + ".git";
	}

	getDescriptionFromRepo(repo) {
		if (!this.github) {
			this.connect();
		}
		var me = this;
		return new Promise(function(resolve, reject) {
			var idx = repo.user + "/" + repo.repo;
			var cached = me.cache[idx];
			if (cached && cached.desc) {
				me.hits++;
				resolve(cached.desc.text);
			} else {
				me.misses++;
				me.github.repos.getContent({
					owner: repo.user,
					repo: repo.repo,
					path: "description.txt"
				}).then(function(data) {
					if (data && data.content) {
						if (!cached) {
							 cached = {}
							 me.cache[idx] = cached;
						}
						var desc = new Buffer(data.content, 'base64').toString();
						cached.desc = {
							text: desc,
							timestamp: new Date().getTime()
						}
						resolve(desc);
					} else {
						if (!cached) {
							cached = {}
							me.cache[idx] = {};
						}
						cached.desc = {
							text: "",
							timestamp: new Date().getTime()
						}
						resolve(null);
					}
				}).catch(function(e) {
					if (!cached) {
						cached = {}
						me.cache[idx] = {};
					}
					cached.desc = {
						text: "",
						timestamp: new Date().getTime()
					}
					reject(e);
				})
			}
		});
	}

	getDependsFromRepo(repo) {
		if (!this.github) {
			this.connect();
		}
		var me = this;
		return new Promise(function(resolve, reject) {
			me.github.repos.getContent({
				owner: repo.user,
				repo: repo.repo,
				path: "depends.txt"
			}).then(function(data) {
				if (data && data.content) {
					resolve(new Buffer(data.content, 'base64').toString());
				} else {
					reject();
				}
			}).catch(function(e) {
				reject(e);
			});
		});
	}

	getDownloadAndHash(repo, branch) {
		if (!this.github) {
			this.connect();
		}
		var me = this;
		return new Promise(function (resolve, reject) {
			var idx = repo.user + "/" + repo.repo;
			var cached = me.cache[idx];
			if (cached && cached.download) {
				me.hits++;
				resolve({
					link: cached.download.link,
					commit: cached.download.sha
				});
			} else {
				me.misses++;
				var req = {
					owner: repo.user,
					repo: repo.repo,
					per_page: 1
				};
				if (branch) {
					req.sha = branch;
				}
				me.github.repos.getCommits(req).then(function(res) {
					if (res && res.length == 1) {
						var sha = res[0].sha;
						if (!cached) {
							cached = {}
							me.cache[idx] = cached;
						}
						var link = "https://github.com/" + repo.user + "/" +
							repo.repo + "/archive/" + sha + ".zip"
						cached.download = {
							link: link,
							sha: sha,
							timestamp: new Date().getTime()
						}
						resolve({
							link: link,
							commit: sha
						});
					} else {
						reject();
					}
				}).catch(function(e) {
					reject(e);
				});
			}
		})

	}

	getAllInfo(repo, mod) {
		var me = this;
		return new Promise(function(resolve, reject) {
			me.getDownloadAndHash(repo, null).then(function(res) {
				var link = res.link;
				var commit = res.commit;
				mod.download_link = link;
				mod.commit_hash = commit;

				me.getDescriptionFromRepo(repo).then(function(desc) {
					mod.description = desc;
					resolve();
				}).catch(function(e) {
					resolve();
				});

				me.registerListener(repo).then(function(res) {
					console.log("Registered repo!");
					console.log(res);
				}).catch(function(e) {
					if (e) console.log(e);
				});
			}).catch(function(e) {
				reject("unable to get download: " + e);
			});
			// reject("504: Gateway Timeout");
		});
	}

	registerListener(repo) {
		var me = this;
		return new Promise(function(resolve, reject) {
			var idx = repo.user + "/" + repo.repo;
			var cached = me.cache[idx];
			if (!cached) {
				cached = {};
				me.cache[idx] = cached;
			} else if (cached.hook_registered) {
				resolve();
				return;
			} else if (repo.user != "minetest-mods") {
				reject();
				return;
			}

			cached.hook_registered = true;
			me.github.repos.createHook({
				owner: repo.user,
				repo: repo.repo,
				name: "web",
				config: {
					url: "http://app-mtmm.rubenwardy.com/v2/notify-mod-update"
				}
			}).then(resolve).catch(reject);
		});
	}
}

module.exports =  {
	RepoServer: RepoServer,
	GithubRepoServer: GithubRepoServer
}
