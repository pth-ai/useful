
exports.capitalize = (aString)->
	aString[0].toUpperCase() + aString.slice(1)


exports.getCookieParam = (cookieData, paramName)->
	for set in cookieData.split("; ")
		inSet = set.split("=")
		if inSet[0] == paramName
			return decodeURIComponent(inSet[1])


exports.merge = merge = (to, takeFrom, takeFrom2)->
	if arguments.length > 2
		cnt = 0
		keys = Object.keys(arguments)
		tmpMrg = merge(arguments[keys.shift()], arguments[keys.shift()])
		merge(tmpMrg, arguments[key]) for key in keys
		return tmpMrg
	for p of takeFrom
		try
			if takeFrom[p].constructor == Object
				to[p] = merge(to[p], takeFrom[p])
			else
				to[p] = takeFrom[p]
		catch e
			to[p] = takeFrom[p]
	return to


exports.makeObject = (prototype)->
	func = ()->
	func.prototype = prototype
	return new func()

# useful for spying on window location changes..
exports.navigateTo = (location)->
	window?.location.href = location