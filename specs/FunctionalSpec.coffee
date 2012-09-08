su = require '../.'

describe "Functional tests for StringUtils",->

	it "needs to capitalize a string",->
		expect( su.capitalize("capitalize me!") ).toEqual( "Capitalize me!" )
