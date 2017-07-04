# apiextender
This module allows to extend an API backend, by adding endpoints or modifying existing endpoints' behaviour.
  This is accomplished in a plug-in fashion.
With apiextender you can :
+   enable third-party developers to create functionalities extending an application
+   support the addition of new features in a simple way

[![NPM](https://nodei.co/npm/apiextender.png?downloads=true&downloadRank=true&stars=true)![NPM](https://nodei.co/npm-dl/apiextender.png?months=6&height=3)](https://nodei.co/npm/apiextender/)

* [Installation](#installation) 
* [Using apiextender](#using)
* [make your environment capable to accept plugins functions](#folder)
* [How to write function that extends the "API"](#howto)
* [Reference](#reference) 
    * [extend(app)](#extend)
    * [install(app,extender,save)](#install)
* [Examples](#examples)
    *   [Examples:How to set an API extensible by plugins](#examplesapi)   
    *   [Examples:How to write extensible plugin functions](#examplesplugin)   
    *   [Examples:override mode](#exampleoverride)   
    *   [Examples:before mode](#examplebefore)   
    *   [Examples:after mode](#exampleafter)   
    *   [Examples:before_after mode](#examplebefore_after)   
    *   [Examples:extend throwing error](#exampleerror)   
    *   [Examples:A Complete Example of plugin extension](#examplecomplete)   
    *   [Example: Extend API on the fly at runtime](#exampleonFly)   
    

## <a name="installation"></a>Installation
Install **apiextender** in your project by typing:

```shell
$ npm install apiextender
```


## <a name="using"></a>Usage
This is an Express module for nodeJs. This section explains how to use it in your code to make your API extensible by plugin.

### Include apiextender
Just require it:
```javascript
var apiextender = require('apiextender');
```

### Using apiextender

```javascript
var express=require('express'); 
var apiextender = require('apiextender');
var app=express();
   
// make your API extensible by plugin techniques in a simple and fast 
// and with one line of code. 
apiextender.extend(app);  // now your API is exensible
```

## <a name="folder"></a>Make your environment compliant to plugins
Plugin functions that extends your API must be defined in a file called ```extend.js```, 
located in a folder named ```plugin``` in the home directory of your application.

### Create plugin folder
To create folder type:
```shell
$ mkdir plugin
```
### Create plugin file container
To create ```extend.js``` type:
```shell
$ cd plugin
$ vi extend.js
```

```extend.js``` contains an array of plugin functions. Now we initialize it as an empty plugin function container:
```javascript
var plugins=[];
module.exports = plugins;
```
  

## <a name="howto"></a>Write your functions that extend the API 
To extend an API endpoint, you must populate the ```plugins``` array containing all functions extending the API.

### extend.js structure
```javascript
var plugins=[];
module.exports = plugins;
```
**`plugins=[]`** is an array of objects , which are functions that constitutes a plugin. Each function is defined as:
```javascript
{
    "resource":"/resourceToExtend",
    "method":"GET",
    "mode":"override",
    "params":[query],
    "extender": function(req,content,cType,callback){
            callback(null,{"Content extension"});
    }
}
``` 

 * URI: URI of the resource to protect
 * method: HTTP method used to call the resource to protect
 * authToken : An array of Strings containing the token types authorized by this role

where:
*   **resource**: URI of the resource to extend
*   **method**  : HTTP method of the resource to extend
*   **mode**    : Mode defining how the resource must be extended. There are four
                  different possible modes: ```override```, ```before```, ```after```, ```before_after```. In detail:
    *   **override**    : overrides the original endpoint definition
    *   **before**      : the plugin function is executed before the original endpoint
    *   **after**       : the plugin function is executed after the original endpoint
    *   **before_after**: the plugin function is executed both before and after the original endpoint
    
*   **params**  : Array of the fields of Express ```req``` object that must be passed to the plugin function in ```reqParams``` param
*   **enabled** : Optional boolean parameter indicating if the plugin is enabled or not. Default is disabled
*   **extender**: Plugin function definition. This function is invoked end executed by apiextender, defined as:  
                  ```function(reqParams,content,contentType,callback)```
    *   **reqParams**   : Object containing the Express request params defined in ```params``` field. 
                          E.g. if ```params=["query"]```,  ```reqParams``` contains the object ```{query:req.query}```
    *   **content**     : Response of the original endpoint when ```mode``` param is set to ```after``` or ```before_after```.  
                          Null when mode is set to ```override``` or ```before```
    *   **contentType** : Content Type of ```content```, e.g. ```application/json``` , ```text/html```...  
                          Null when mode is set to ```override``` or ```before```  
    *   **callback**    : callback function to apiextender. It must be invoked with params ```error``` and ```newContent```, defined as:  
                          ```callback(error,newContent)```
        *   **error** : If an error occurs, apiextender stops the request execution and sends a response to the client
                                        with this object, that must have two fields:
            *   **error_code**      : HTTP status code
            *   **error_message**   : error message content   
        *   **newContent** : response sent to the client if mode is ```override```, ```after``` or ```before_after``` 
                                (for the latter, only for what is executed in the ```after``` part). <br>
                             If mode is set to ```before``` or ```before_after``` 
                             (for the latter, only for what is executed in the ```before``` part), it is an
                             object whose keys are appended to Express' ```req``` .    
    
####<a name="nb"></a> Warning: 
If `mode` is set to `before_after`, it is mandatory to declare in `extender` param two functions, 
                        both for the `before` and `after` actions. 
                       So the `extender` parameter is not a function but an object containing two keys: 
*   **before**: the function definition for `before` actions
*   **after** : the function definition for `after` actions

######Example
```javascript
{
    //.... 
    //.... 
    "mode":"before_after"
    "extender":{ 
            "before": function(req,content,cType,callback){
                // before logic
                callback(null,{"Content extension before"});
            },
            "after": function(req,content,cType,callback){
                // after logic
                callback(null,{"Content extension after"});
            }
    }
}
``` 

######Example of extend.js plugin definition
```javascript
var plugins=[
    {
        "resource":"/resourceToExtend",
        "method":"GET",
        "mode":"override",
        "params":[query],
        "extender": function(req,content,cType,callback){
            callback(null,{"Content extension"});
        }
    },             
    {
        "resource":"/OtherResourceToExtend",
        "method":"GET",
        "mode":"before",
        "params":[query],
        "extender": function(req,content,cType,callback){
            callback(null,{"Content extension"});
        }
    }
]             
``` 


## <a name="reference"></a>Reference
### <a name="extend"></a>`extend(app)` 
Function that extends the API. The param `app` is the application that you want extend.  

### <a name="install"></a>`install(app,extender,save)` 
Function that extends an API at runtime, without stopping and restarting your application.
* `app` is the application that you want extend  
* `extender` is the plugin function described in section [plugin extender structure](#functionextension)  
* `save` if true, the plugin is saved in the `extend.js` file, being appended in the `plugin` array and becoming permanent.

######Example:
```javascript
var express=require('express'); 
var apiextender = require('apiextender');
var app=express();

apiextender.extend(app);  // now your API is extensible

// Define an endpoint wrapping apiextender install function that lets you to extend API on the fly
// The access to this endpoint should be protectd with token privileges
app.post("/installPlugin",function(req,res,next){
    // check for tokens
    //.....
     
    // install and run the plugin
    apiextender.install(app,req.body.pluginExtender,req.body.save || false); 
    res.send({"status":"installed"});    
});
```


## <a name="examples"></a>`Examples`
### <a name="examplesapi"></a>`Examples: How to set an API extensible by plugins`
From your application home directory type:
```shell
$ cd /Your_App_Home
$ npm install apiextender   // install apiextender
$ mkdir plugin              // Create plugin container folder
$ cd plugin                 // go into plugin folder
$ vi extend.js              // Create plugin container file
```


Insert this content in `extend.js`.
```javascript
var plugins=[];
module.exports = plugins; 
``` 

Include the apiextender module in `app.js`
```javascript
var express=require('express'); 
var apiextender = require('apiextender');
var app=express();

apiextender.extend(app); 
``` 

### <a name="examplesplugin"></a>`Examples: How to extend an API`

Suppose we want to extend this API:
```javascript
var express=require('express'); 
var apiextender = require('apiextender');
var app=express();

apiextender.extend(app);  // now your API is exensible

app.get('/overrideOriginal', function(req, res){
  res.send({"response":"override"});
});
app.get('/beforeOriginal', function(req, res){
  var params=req.optionalParams || null;
  var response = params!=null ? {"response":"before", "response_before":params} : {"response":"before"}  
  res.send(response);
});
app.get('/afterOriginal', function(req, res){
  res.send({"response":"after"});
});
app.get('/before_afterOriginal', function(req, res){
var params=req.optionalParams || null;
  var response = params!=null ? {"response":"before_after", "response_before":params} : {"response":"before_after"}  
  res.send(response);  
});
``` 

#### <a name="exampleoverride"></a>`Override mode`
With no plugin function defined, the endpoint response is:
```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/overrideOriginal
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 23
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"override"} // original response because no extension function
 $ 
```

Now we extend "/overrideOriginal" endpoint with a plugin, writing a plugin function in `extend.js`
```javascript
var plugins=[
    {
        "resource":"/overrideOriginal",  // extend overrideOriginal endpoint
        "method":"GET",                  // extend overrideOriginal endpoint in get method  
        "mode":"override",               // endpoint overrideOriginal must be overrided   
        "params":[query],                // express request "req.query" should be throw to extender function 
        "extender": function(requestParams,content,cType,callback){   // this is the extender Function definition
            // the mode is set to "override" so "content,cType" are both null
            var username=requestParams.username || ""; // if username exist is set otherwise use a void string
            callback(null,{"response":"Hello " + username + " this is a plugin function that override"});  
            //        ^
            //        |
            //      No Error    
        }
    }
];
module.exports = plugins;
``` 

Restart your application (or invoke `apiextender.install`) to apply the plugin function.
If you curl the endpoint, you can notice that the original endpoint is not executed, being overridden by the plugin function:
```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/overrideOriginal
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 60
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"Hello this is a plugin function that ovveride"} // original response "{"response":"before"}" 
                                                              // overrided by extension function
 $
```


#### <a name="examplebefore"></a>`Before mode`
With no plugin function defined, the endpoint response is:
```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/beforeOriginal
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 51
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"before"} // original response because no extension function
```

Now we extend "/beforeOriginal" endpoint with a plugin, writing a plugin function in `extend.js`
```javascript
var plugins=[
    {
        "resource":"/beforeOriginal",  // extend beforeOriginal endpoint
        "method":"GET",                // extend beforeOriginal endpoint in get method  
        "mode":"before",               // plugin function must be executed before original endpoint beforeOriginal   
        "params":[query],              // express request "req.query" should be throw to extender function 
        "extender": function(requestParams,content,cType,callback){   // this is the extender Function definition
            // the mode is set to "before" so "content,cType" are both null
            var username=requestParams.username || ""; // if username exist is set otherwise use a void string
            callback(null,{"optionalParams":"Hello " + username + " this is a plugin function that extend"});  
            //        ^
            //        |
            //      No Error    
        }
    }
];
module.exports = plugins;
``` 

Restart your application (or invoke `apiextender.install`) to apply the plugin function.
If you curl the endpoint, you can notice that the original endpoint is extended by the plugin function:

```shell 
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/beforeOriginal?username=Alex
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 90
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"before","response_before":"Hello Alex this is a plugin function that extend"} // original and extended response
```


#### <a name="exampleafter"></a>`After mode`
With no plugin function defined, the endpoint response is:
```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/afterOriginal
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 20
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"after"} // original response because no extension function
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/afterOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 20
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive
  
{"response":"after"} // original response because no extension function
```

Now we extend "/afterOriginal" endpoint with a plugin, writing a plugin function in `extend.js`
```javascript
var plugins=[
    {
        "resource":"/afterOriginal",  // extend afterOriginal endpoint
        "method":"GET",               // extend afterOriginal endpoint in get method  
        "mode":"after",               // plugin function must be executed after original endpoint afterOriginal   
        "params":[query],             // express request "req.query" should be throw to extender function 
        "extender": function(requestParams,content,cType,callback){   // this is the extender Function definition
            // the mode is set to "after" so "content,cType" are both not null
             if(cType==="application/json"){  // if content is a Json
                var username=requestParams.username || ""; // if username exist is set otherwise use a void string
                content.after_response="Hello " + username + " this is a plugin function that extend";
             }
            callback(null,content);  
            //        ^
            //        |
            //      No Error    
        }
    }
];
module.exports = plugins;
``` 

Restart your application (or invoke `apiextender.install`) to apply the plugin function.
If you curl the endpoint, you can notice that the original endpoint is extended by the plugin function:

```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/afterOriginal
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 82
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"after","after_response":Hello this is a plugin function that extend"} // original response extended
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/afterOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 87
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive
  
 {"response":"after","after_response":Hello Alex this is a plugin function that extend"} // original response extended
```


#### <a name="examplebefore_after"></a>`Examples: before_after mode`
With no plugin function defined, the endpoint response is:
```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/before_afterOriginal
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 27
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"before_after"} // original response because no extension function
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/before_afterOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 27
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
  Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive
  
{"response":"before_after"} // original response because no extension function
```

Now we extend "/before_afterOriginal" endpoint with a plugin, writing a plugin function in `extend.js`
```javascript
var plugins=[
    {
        "resource":"/before_afterOriginal",  // extend before_afterOriginal endpoint
        "method":"GET",                      // extend before_afterOriginal endpoint in get method  
        "mode":"before_after",               // plugin function must be executed before and after original endpoint before_afterOriginal   
        "params":[query],                    // express request "req.query" should be throw to extender function 
        "extender":{
            "before": function(requestParams,content,cType,callback){   // this is the extender Function definition
                        // the mode is set to "before_after" so in before function "content,cType" are both null
                        var username=requestParams.username || ""; // if username exist is set otherwise use a void string
                        callback(null,{"optionalParams":"Hello " + username + " this is a plugin function that extend"});  
                        //        ^
                        //        |
                        //      No Error    
            },
            "after": function(requestParams,content,cType,callback){   // this is the extender Function definition
                        // the mode is set to "before _after" so in after function "content,cType" are both not null
                        if(cType==="application/json"){  // if content is a Json
                            var username=requestParams.username || ""; // if username exist is set otherwise use a void string
                            content.after_response="Hello " + username + " this is a plugin function that extend";
                        }
                        callback(null,content);  
                        //        ^
                        //        |
                        //      No Error     
            }
    }
];
module.exports = plugins;
``` 

Restart your application (or invoke `apiextender.install`) to apply the plugin function.
If you curl the endpoint, you can notice that the original endpoint is extended by the plugin function:
```shell 
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/before_afterOriginal
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 154
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive
  
 {
   "response":"before_after",
   "response_before":"Hello this is a plugin function that extend",  // original and extended response
   "response_after":"Hello this is a plugin function that extend"
 } 

$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/before_afterOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 164
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive
 
 {
    "response":"before_after",
    "response_before":"Hello Alex this is a plugin function that extend", // original and extended response
    "response_after":"Hello Alex this is a plugin function that extend"
 }
```


#### <a name="exampleerror"></a>`Error throwing`
With no plugin function defined, the endpoint response is:
```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/beforeOriginal
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 51
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"before"} // original response because no extension function
 $ // now with username param (no response changes)
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/beforeOriginal?username=Alex
  X-Powered-By: Express
  Content-Type: application/json; charset=utf-8
  Content-Length: 51
  ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
  Date: Fri, 11 Nov 2016 13:16:44 GMT
  Connection: keep-alive
  
  {"response":"before"} // original response because no extension function
```
Now we extend "/beforeOriginal" endpoint with a plugin, writing a plugin function in `extend.js`. Starting from the 
example [`Examples:before mode`](#examplebefore), we edit the plugin function to throw an error if no `username` field is sent. 
```javascript
var plugins=[
    {
        "resource":"/beforeOriginal",  // extend beforeOriginal endpoint
        "method":"GET",                  // extend beforeOriginal endpoint in get method  
        "mode":"before",                 // endpoint beforeOriginal must be overrided   
        "params":[query],                // express request "req.query" should be throw to extender function 
        "extender": function(requestParams,content,cType,callback){   // this is the extender Function definition
            // the mode is set to "override" so "content,cType" are both null
            var username=requestParams.username || null; // if username exist is set otherwise use a void string
            if(!username)
                callback({"error_code":"400", "error_message":"no username field"},null);
            else
                callback(null,{"response":"Hello " + username + " this is a plugin function that override"});  
                //        ^
                //        |
                //      No Error    
        }
    }
];
module.exports = plugins;
``` 

Restart your application (or invoke `apiextender.install`) to apply the plugin function.
If you curl the endpoint, you can notice that the original endpoint is not executed after the plugin function,
because no username field is sent. This is due to the fact that `before extension` function stops the execution 
with an error message to the apiextender callback:

```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/beforeOriginal
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 37
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"error_message":"no username field"}      // only error_message from extended function response                                                              
 $
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/beforeOriginal?username=Alex
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 90
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"before","response_before":"Hello Alex this is a plugin function that extend"} // original and extended response
```


#### <a name="examplecomplete"></a>`Examples: A Complete Eexample of plugin extension`
With no plugin function defined, the endpoint response is:
```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/overrideOriginal?username=Alex
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 23
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"override"} // original response because no extension function
$
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/beforeOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive

{"response":"before"} // original response because no extension function
$
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/afterOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 20
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive

{"response":"after"} // original response because no extension function
$
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/before_afterOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 27
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
  Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive
  
{"response":"before_after"} // original response because no extension function
```

Now we extend "/....Original" endpoint with a plugin, writing a plugin function in `extend.js`. 

```javascript
var plugins=[
    {
            "resource":"/overrideOriginal",  // extend overrideOriginal endpoint
            "method":"GET",                  // extend overrideOriginal endpoint in get method  
            "mode":"override",               // endpoint overrideOriginal must be overrided   
            "params":[query],                // express request "req.query" should be throw to extender function 
            "extender": function(requestParams,content,cType,callback){   // this is the extender Function definition
                // the mode is set to "override" so "content,cType" are both null
                var username=requestParams.username || ""; // if username exist is set otherwise use a void string
                callback(null,{"response":"Hello " + username + " this is a plugin function that override"});  
                //        ^
                //        |
                //      No Error    
            }
    },
    {
            "resource":"/overrideOriginal",  // extend overrideOriginal endpoint
            "method":"GET",                  // extend overrideOriginal endpoint in get method  
            "mode":"before",                 // endpoint overrideOriginal must be overrided   
            "params":[query],                // express request "req.query" should be throw to extender function 
            "extender": function(requestParams,content,cType,callback){   // this is the extender Function definition
                // the mode is set to "override" so "content,cType" are both null
                var username=requestParams.username || null; // if username exist is set otherwise use a void string
                if(!username)
                    callback({"error_code":"400", "error_message":"no username field"},null);
                else
                    callback(null,{"response":"Hello " + username + " this is a plugin function that override"});  
                    //        ^
                    //        |
                    //      No Error    
            }
    },
    {
            "resource":"/afterOriginal",  // extend afterOriginal endpoint
            "method":"GET",               // extend afterOriginal endpoint in get method  
            "mode":"after",               // plugin function must be executed after original endpoint afterOriginal   
            "params":[query],             // express request "req.query" should be throw to extender function 
            "extender": function(requestParams,content,cType,callback){   // this is the extender Function definition
                // the mode is set to "after" so "content,cType" are both not null
                 if(cType==="application/json"){  // if content is a Json
                    var username=requestParams.username || ""; // if username exist is set otherwise use a void string
                    content.after_response="Hello " + username + " this is a plugin function that extend";
                 }
                callback(null,content);  
                //        ^
                //        |
                //      No Error    
            }
    },    
    {
        "resource":"/before_afterOriginal",  // extend before_afterOriginal endpoint
        "method":"GET",                      // extend before_afterOriginal endpoint in get method  
        "mode":"before_after",               // plugin function must be executed before and after original endpoint before_afterOriginal   
        "params":[query],                    // express request "req.query" should be throw to extender function 
        "extender":{
            "before": function(requestParams,content,cType,callback){   // this is the extender Function definition
                        // the mode is set to "before_after" so in before function "content,cType" are both null
                        var username=requestParams.username || ""; // if username exist is set otherwise use a void string
                        callback(null,{"optionalParams":"Hello " + username + " this is a plugin function that extend"});  
                        //        ^
                        //        |
                        //      No Error    
            },
            "after": function(requestParams,content,cType,callback){   // this is the extender Function definition
                        // the mode is set to "before _after" so in after function "content,cType" are both not null
                        if(cType==="application/json"){  // if content is a Json
                            var username=requestParams.username || ""; // if username exist is set otherwise use a void string
                            content.after_response="Hello " + username + " this is a plugin function that extend";
                        }
                        callback(null,content);  
                        //        ^
                        //        |
                        //      No Error     
            }
    }
];
module.exports = plugins;
``` 

Restart your application (or invoke `apiextender.install`) to apply the plugin function.
If you curl the endpoint, you can notice that the original endpoint is extended by the plugin function:
```shell 
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/overrideOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 65
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive

 {"response":"Hello Alex this is a plugin function that ovveride"} // original response "{"response":"before"}" 
                                                              // overrided by extension function
$
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/beforeOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 90
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive

{"response":"before","response_before":"Hello Alex this is a plugin function that extend"} // original and extended response
$
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/afterOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 88
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive

{"response":"after","after_response":Hello Alex this is a plugin function that extend"} // original response extended
$
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/before_afterOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 165
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive

{
    "response":"before_after",
    "response_before":"Hello Alex this is a plugin function that extend",  // original and extended response
    "response_after":"Hello Alex this is a plugin function that extend"
}    
```



#### <a name="exampleonFly"></a>`Extend API on the fly at runtime`
To extend an API on the fly as described in reference section [install(app,extender,save)](#install), we need to define an
endpoint that wraps apiextender install function. Add these code lines to you app.js:
```javascript
var express=require('express'); 
var apiextender = require('apiextender');
var app=express();
   
// .....
// Old app.js logic
// ..... 

// Define an endpoint that wrap apiextender install function that lets you to extend API on the fly
// The access to this endpoint should be protectd with token privileges
app.post("/installPlugin",function(req,res,next){
    // check for tokens
    //.....
     
    apiextender.install(app,req.body.pluginExtender,req.body.save || false);    
    res.send({"status":"installed"});
});
```

With no plugin function defined, the endpoint response is:
```shell
 $ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/overrideOriginal?username=Alex
 X-Powered-By: Express
 Content-Type: application/json; charset=utf-8
 Content-Length: 23
 ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
 Date: Fri, 11 Nov 2016 13:16:44 GMT
 Connection: keep-alive
 
 {"response":"override"} // original response because no extension function
```

Now we extend "/overrideOriginal" endpoint with a plugin, installed on the fly without defining it in `extend.js`.
To install, just call `/installPlugin` in POST:
```shell
EXTENDER='{
            "pluginExtender":{
                "resource":"/overrideOriginal",  // extend overrideOriginal endpoint
                "method":"GET",                  // extend overrideOriginal endpoint in get method  
                "mode":"override",               // endpoint overrideOriginal must be overrided   
                "params":[query],                // express request "req.query" should be throw to extender function 
                "extender": function(requestParams,content,cType,callback){   // this is the extender Function definition
                     // the mode is set to "override" so "content,cType" are both null
                    var username=requestParams.username || ""; // if username exist is set otherwise use a void string
                    callback(null,{"response":"Hello " + username + " this is a plugin function that override"});  
                    //        ^
                    //        |
                    //      No Error    
                }
            },
            "save":false; // not save extenson plugin
}'
$
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X POST http://hostname/overrideOriginal?username=Alex
    -d $EXTENDER
    
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 22
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive
 
{"status":"installed"} // plugin extension installed
```


Restart your application (or invoke `apiextender.install`) to apply the plugin function.



**Without restarting** your application, if you curl the endpoint, you can notice that the original endpoint is extended by the plugin function:
```shell 
$ curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/overrideOriginal?username=Alex
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 65
ETag: "35-6BXjKyRXlm+rSEU9a23z/g"
Date: Fri, 11 Nov 2016 13:16:44 GMT
Connection: keep-alive

 {"response":"Hello Alex this is a plugin function that ovveride"} // original response "{"response":"before"}" 
                                                                   // overrided by extension function
$
```

License - "MIT License"
-----------------------

MIT License

Copyright (c) 2016 aromanino

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Author
------
Alessandro Romanino ([a.romanino@gmail.com](mailto:a.romanino@gmail.com))<br>
Guido Porruvecchio ([guido.porruvecchio@gmail.com](mailto:guido.porruvecchio@gmail.com))

Contributors
------
CRS4 Microservice Core Team ([cmc.smartenv@crs4.it](mailto:cmc.smartenv@crs4.it))
