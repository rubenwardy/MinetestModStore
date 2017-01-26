# Minetest Mod Store

Written by rubenwardy  
License: LGPLv2.1+

## Basic concepts and assumptions

* Packages refers to mods, texture packs, and subgames - plus any future additions
* Packages have a primary key of username/modname
* Meta data
	* Packages are either in manual or automatic mode
	* Automatic packages are updated by workers by checking repositories
* Download versions
	* VCS mods: Downloads point to a particular commit, and include a checksum
	* non-VCS mods: will eventually be copied to a server
	* Workers are used to poll for updates
	* Web hooks can be used on GitHub (and all github.com/minetest-mods will use this)
* RESTful server
	* Cluster-ised
* Workers - are API clients to the main server, and are handed tasks to perform.
            They can be run on separate machines to allow the main server to be
            as performant as possible

## Why NodeJS?

* Well supported
* Good with JSON
* Works nicely with microservices / clusterisation
* Can reuse code I've already written
