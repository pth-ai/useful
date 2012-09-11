Useful
===========

A collection of useful JS functions for both Node and front end

## Usage

**Backend**

**Installation**

		npm install useful

**Using in code**

		var useful = require('useful');

**FrontEnd (coming soon..)**

### Features

**capitalize** useful.capitalize(String)


```javascript
useful.capitalize("string cap")
=> "String cap"
```

**getCookieParam** useful.getCookieParam(String)

```javascript
useful.getCookieParam("connect.sid=s%3Acv%2FirAoWefH%2BK7O0IQitv4iP.lsluQW0GIHi8kfMoKF%2BAS85xa4l6CAbJHkqpPXJDY8Y","connect.sid")
=> "s:cv/irAoWefH+K7O0IQitv4iP.lsluQW0GIHi8kfMoKF+AS85xa4l6CAbJHkqpPXJDY8Y"
```

**merge** useful.merge(to, takeFrom*)

```javascript
useful.merge({"a": "a", "b":"b", "deep": {"a":"a", "b":"b"}}, {"c":"c", "d":"d", "deep": {"c":"c", "d":"d"}})
=> {"a": "a", "b":"b", "c":"c", "d":"d", "deep": {"a":"a", "b":"b", "c":"c", "d":"d"}}
```

**makeObject** useful.makeObject(Object)

```javascript
var o = useful.makeObject({param: "value"})
=> {}
o.param
=> "value"
```

## License 

MIT
