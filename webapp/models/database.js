var Sequelize = require("sequelize")
var async = require("async")

var sequelize = new Sequelize("database", "", "", {
	dialect: "sqlite",
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	},

	// SQLite only
	storage: "db.sqlite"
})

var User = sequelize.define("user", {
	username: { type: Sequelize.STRING(100), unique: true }
})


var Mod = sequelize.define("mod", {
	basename: Sequelize.STRING(100),
	type: Sequelize.ENUM("mod", "game", "texturepack"),

	title: Sequelize.STRING(100),
	description: Sequelize.STRING(900),
	forum_id: Sequelize.STRING(40),

	repo_url: Sequelize.STRING(250),
	repo_hash: Sequelize.STRING(250),

	approved: Sequelize.BOOLEAN,
})

User.hasMany(Mod)
Mod.belongsTo(User)

var ModDownload = sequelize.define("moddownload", {
	url: Sequelize.STRING(250),
	hash: Sequelize.STRING(256),
	size: Sequelize.INTEGER,

	approved: Sequelize.BOOLEAN,
})
Mod.hasMany(ModDownload)
ModDownload.belongsTo(Mod)

var Worker = sequelize.define("worker", {
	token: Sequelize.STRING(128)
})

var Work = sequelize.define("work", {
	work_type: Sequelize.ENUM("fetch", "scan", "forum")
})

Mod.hasMany(Work)
Worker.hasMany(Worker)
Work.belongsTo(Worker)
Work.belongsTo(Mod)

const CMod = require("./../../common/mod")
function convertRowToMod(row) {
	var mod = new CMod(row.user.username)
	mod.basename = row.basename
	mod.type = row.type
	mod.title = row.title
	mod.description = row.description
	mod.forum_id = row.forum_id
	mod.forum_url = mod.getForumURL()
	mod.downloads = []
	mod.download = null

	if (row.moddownloads) {
		mod.downloads = row.moddownloads.map((download) => {
			return {
				url: download.url,
				hash: download.hash || "",
				size: download.size || -1
			}
		})

		if (mod.downloads.length > 0) {
			mod.download = mod.downloads[0]
		}
	}

	mod.repo = {
		url: row.repo,
		hash: row.repo_hash
	}
	mod.approved = row.approved

	return mod
}

async.parallel([
	function(callback) { User.sync().then(callback) },
	function(callback) { Mod.sync().then(callback) },
	function(callback) { ModDownload.sync().then(callback) },
	function(callback) { Worker.sync().then(callback) },
	function(callback) { Work.sync().then(callback) },
	function() {
		User.findOrCreate({
			where: {
				username: "rubenwardy"
			},
			defaults: {}
		}).then(function(user) {
			user = user[0]

			var assert = require("assert")
			assert(user.id)
			Mod.findOrCreate({
				where: {
					basename: "awards",
					userId: user.id
				},
				defaults: {
					user: user,
					type: "mod",

					title: "Awards",
					description: "Adds awards to minetest",
					forum_id: "4870",

					repo_url: "https://github.com/minetest-mods/awards/",
					repo_hash: "c994978683355417783586262914d4be128cbdf0",

					approved: true
				}
			}).then(function(mod) {
				mod = mod[0]

				ModDownload.findOrCreate({
					where: {
						modId: mod.id
					},
					defaults: {
						mod: mod,

						url: "https://github.com/minetest-mods/awards/zipball/master",
						hash: "",
						size: -1,

						approved: true
					}
				}).then(function(moddownload) {
					Worker.findOrCreate({
						where: {
							token: "foobar"
						},
						defaults: {}
					}).then(function(worker) {
						worker = worker[0]

						Work.findOrCreate({
							where: {
								modId: mod.id
							},
							defaults: {
								mod: mod,
								work_type: "fetch"
							}
						}).then(function(mod) {

						})
					})
				})
			})
		})
	}])

module.exports = {
	User: User,
	Mod: Mod,
	ModDownload: ModDownload,
	Work: Work,
	Worker: Worker,
	convertRowToMod: convertRowToMod
}
