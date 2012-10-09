useful = require '../.'

describe "Functional tests",->

	it "needs to capitalize a string",->
		expect( useful.capitalize("capitalize me!") ).toEqual( "Capitalize me!" )


	it "needs to parse a cookie",->
		testCookie = "connect.sid=s%3Acv%2FirAoWefH%2BK7O0IQitv4iP.lsluQW0GIHi8kfMoKF%2BAS85xa4l6CAbJHkqpPXJDY8Y"
		parsedSecondPart = "s:cv/irAoWefH+K7O0IQitv4iP.lsluQW0GIHi8kfMoKF+AS85xa4l6CAbJHkqpPXJDY8Y"
		expect(useful.getCookieParam(testCookie,"connect.sid")).toEqual(parsedSecondPart)


	it "needs to merge two objects",->
		merged = useful.merge {"a": "a", "b":"b", "deep": {"a":"a", "b":"b"}}, {"c":"c", "d":"d", "deep": {"c":"c", "d":"d"}}
		expect(merged).toEqual( {"a": "a", "b":"b", "c":"c", "d":"d", "deep": {"a":"a", "b":"b", "c":"c", "d":"d"}} )
		expect(merged.deep).toEqual({"a":"a", "b":"b", "c":"c", "d":"d"})

	it "copies an object in a way that doesnt point to the original object",->
		origin = {a:{b:{c:"d"}}}
		dest = {}
		useful.merge(dest,origin)
		dest.a.b.c = "_d"
		expect(dest.a.b.c).toEqual("_d")
		expect(origin.a.b.c).toEqual("d")

	it "needs to create an object with set prototype",->
		proto = {param: "value"}
		prototyped = useful.makeObject(proto)
		# object should remain clean
		expect(JSON.stringify(prototyped)).toEqual("{}")
		expect(prototyped.param).toEqual(proto.param)
