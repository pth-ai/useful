
exports.capitalize = (aString)->
	aString[0].toUpperCase() + aString.slice(1)


exports.getCookieParam = (cookieData, paramName)->
	for set in cookieData.split("; ")
		inSet = set.split("=")
		if inSet[0] == paramName
			return decodeURIComponent(inSet[1])

