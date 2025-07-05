soc
===

soc is a simple object composer, that allows you to compose/merge objects together.  
Note this will change the values of the object reference you pass in initially, otherwise soc will create an object to compose for you.

# API
You use soc by requiring the soc module
```javascript
var soc = require('soc')
```


### soc
Give soc an object to wrap or just invoke soc, soc will use an empty object by default.  
soc will return an object that wraps over the object reference you passed in.  
That returned object will allow you to compose with the object you gave it.
```javascript
soc() //=> soc({})
```
will return the `merge` and `unwrap` methods wrapping the object state.


### merge
if you want to keep building on top of that object, use the `merge` method to copy properties over to the initial object.  
The cool part is soc will recursively return new soc objects after you finish merging so you can keep composing with objects.
```javascript
soc = soc()
soc.merge({foo: 'foo'}) //=> soc({foo: 'foo'})
```


### unwrap
once you're finished merging the object you created with soc, use `unwrap` to return the final object
```javascript
soc = soc()
soc.merge({foo: 'foo'}).merge({bar: 'bar'}).unwrap() //=> {foo: 'foo', bar: 'bar'}
```
