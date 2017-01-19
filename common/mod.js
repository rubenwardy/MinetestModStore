"use strict"

var ModType = {
	mod: "mod",
	game: "game",
	texturepack: "texturepack"
}

class Mod {
	constructor(author) {
		this.author = author || null
		this.type = null
		this.basename = null
		this.title = null
		this.description = ""
		this.forum_id = null
		this.forum_url = null

		this.download = null
		this.repo = null
		this.approved = false
	}

	getForumURL() {
		return "https://forum.minetest.net/viewtopic.php?t=" + this.forum_id
	}

	getIssues() {
		var problems = []

		if (!this.author) {
			problems.append("needs forum author name")
		}

		if (!this.basename) {
			problems.append("needs basename")
		}

		if (!this.title) {
			problems.append("needs title (this should never happen)")
		}

		if (!this.download_link) {
			problems.append("needs download link")
		}

		return {
			problems: problems,
			suggestions: []
		}
	}

	toPlainDictionary() {
		function isFunction(obj) {
			return !!(obj && obj.constructor && obj.call && obj.apply)
		}

		var res = {}
		for (var key in this) {
			if (this.hasOwnProperty(key) && !isFunction(this[key])) {
				res[key] = this[key]
			}
		}
		return res
	}
}

module.exports = Mod
