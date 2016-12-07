# apiextender
This module deals with to extend an API backend that adds a specific feature to an existing API as plugin(add-in, addin, add-on, addon).   
apiextender let to :
+   enable third-party developers to create abilities which extend an application
+   support easily adding new features

**apiextender** allow to extend your API with plugin techniques in a **simple and fast** and with **few lines of code**.

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
To use **apiextender** install it in your project by typing:

```shell
$ npm install apiextender
```


## <a name="using"></a>Using apiextender
This is an express module for nodejs and now we explain how to use it in you code to make your API extensible by plugin.

### Include apiextender
Just require it like a simple package:
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

## <a name="folder"></a>Make your environment capable to accept plugins functions
Plugin functions to extend API must be defined in a file called extend.js in a folder named plugin in the home directory of your application.
extend.js contains an array of plugin functions. 

### Create Folder where save plugin functions
To create folder type:
```shell
$ mkdir plugin
```
### Create extend.js plugin functions container
To create extend.js type:
```shell
$ cd plugin
$ vi extend.js
```

extend.js contains an array of plugin functions so now we initialize it as an empty plugin function container.   
Insert in the file this contents
```javascript
var plugins=[];
module.exports = plugins;
```
**to see how to write plugin function read the section [How to write function that extends the "API"](#howto)**
  

## <a name="howto"></a>How to write function that extends the "API" 
To extend an API endpoint you must populate the extend.js file and more specifically the array plugins containing a
list of functions that extends the "API".

### extend.js structure
extend.js is defined as:  
```javascript
var plugins=[];
module.exports = plugins;
```
**`plugins=[{function_extension(s)}]`** is an array of function_extension(s) object , where each function_extension(s) object is a plugin.
function_extension(s) are defined as the example below:
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

Next an example of extend.js plugin extension definition. It extend "/resourceToExtend" and "/OtherresourceToExtend" resources
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

### <a name="functionextension"></a>function_extension(s) structure
function_extension(s) are defined as:
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

where:
+   **resource**: A string containing the resource URI to Extend
+   **method**  : A string containing the the resource method to Extend
+   **mode**    : A string containing the mode on which the resource must be extended. There are four
                  different possible mode values **"override", "before", "after", "before_after"** where:
    +   **override**    : override the original endpoint definition.
    +   **before**      : the extension function is executed before the endpoint to extend.
    +   **after**       : the extension function is executed after the endpoint to extend.
    +   **before_after**: the extension function is executed before and after the endpoint to extend. VERY IMPORTANT --> [Read the note Well](#nb) 
+   **params**  : An array of strings containing the list or express "request" params to pass at the extender function in the reqParams param.
+   **enabled** : It is an optional boolean parameter, if false this plugin is not enabled by default otherwise if true or not defined the plugin is enabled.
+   **extender**: Extender function definition with which to extend the endpoint. This function is invoked end executed by 
                  apiextender, and is defined as:  
                  **function(reqParams,content,contentType,callback)**
    +   **reqParams**   : An Object containing the express request params defined in "params" field. For example if :  
                        params=["query"] ---> it contains an object as {query:QueryParams} where QueryParams==req.query.
    +   **content**     : Contains the content of the original endpoint response when "mode" param is set to "after" or "before_after".  
                          It is "null" when mode is set to "override" or "before".
    +   **contentType** : String that describe the contentType in content. For example "application/json" , "text/html" , "text/css" ...  
                          It is "null" when mode is set to "override" or "before".  
    +   **callback**    : callback function to apiextender. It must be invoked with two params **"error"** and **"newContent"**  
                          The function **callback(error,newContent)** definition
        +   error : If an error occurs in your extender function, you can throw it to apiexender setting error as an object containing
                    two keys :
            +   **error_code**      : containing the http status code to send to the client(es 204, 400, 404, 500).
            +   **error_message**   : containing a message to send to the client.   
                    If error is not **null** when callback is invoked, apiextender stops the request execution and send a response to the client with this object error.
        +   newContent : The new content to send to the client if the mode is set to "override", "after" or "before_after", or the content to
                         add to the express request(req) to be thrown to apiextender if  mode is set to "before".
    

####<a name="nb"></a> `NB`: If `mode` is set to "before_after", is mandatory to declare in `extender` param two function, one for actions "before" and one other for actions "after". So the `extender` parameter is not a declaration function but an object containing two keys: 
+   **before**: the function declaration for "before" actions
+   **after** : the function declaration for "after" actions

Here an example
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

## <a name="reference"></a>Reference
### <a name="extend"></a>`extend(app)` 
This is the function that allow to make your "API" extensible. 
The param `app` is the application that you want extend.  

### <a name="install"></a>`install(app,extender,save)` 
This is a function suite that allow you to extend an API at runtime without stop and restart you application.
It lets you don't stop your application to write the plugin extender function in extender.js file.  
The param `app` is the application that you want extend  
The param `extender` is the extender plugin function defined as in section [plugin extender structure](#functionextension)  
The param `save` if "true" the extender plugin is saved in the extend.js file then it becomes permanent otherwise if "false" the plugin function
is installed but not saved so when application is stopped and restarted the extender plugin extension is not reloaded.
Example:
```javascript
var express=require('express'); 
var apiextender = require('apiextender');
var app=express();
   
// make your API extensible by plugin techniques in a simple and fast 
// and with one line of code. 
apiextender.extend(app);  // now your API is exensible

// Define an endpoint that wrap apiextender install function that lets you to extend API on the fly
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
From a shell, go in your application home directory and type de follow commands:
```shell
$ cd /Your_App_Home
$ npm install apiextender   // install apiextender
$ mkdir plugin              // Create plugin container folder
$ cd plugin                 // go into plugin folder
$ vi extend.js              // Create plugin container file
```


Insert this content in the file extend.js then save and exit. You have defined the plugin extender structure( void list of plugin )
```javascript
// insert the follow content to init the system to accept plugin function
// At the moment no plugin function are defined so the plugin list is void.
var plugins=[];
module.exports = plugins; 
``` 

Now from your app.js include the apiextender module.
```javascript
var express=require('express'); 
var apiextender = require('apiextender');
var app=express();

apiextender.extend(app);  // now your API is exensible
``` 

Now You API is ready to be extensible with plugin functions. To write plugin functions see example bellow and read the section [How to write function that extends the "API"](#howto) 

### <a name="examplesplugin"></a>`Examples: How to write extensible plugin functions`

Suppose we want extend this API
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

#### <a name="exampleoverride"></a>`Examples: override mode`
With no extension plugin function defined, if we test it with curl we have:
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

Now we extend "/overrideOriginal" endpoint with a plugin. To do it we write a plugin function in extend.js 
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

now shutdown and restart your application (or invoke apiextender.install) to apply plugin function extension and make the same test with curl. You can see that original endpoint
is not executed and overridden by extension plugin function:
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


#### <a name="examplebefore"></a>`Examples: before mode`
With no extension plugin function defined, if we test it with curl we have:
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

Now we extend "/beforeOriginal" endpoint with a plugin. To do it we write a plugin function in extend.js 
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

now shutdown and restart your application (or invoke apiextender.install) to apply plugin function extension and make the same test with curl. You can see that original endpoint
is extended by plugin function:
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


#### <a name="exampleafter"></a>`Examples: after mode`
With no extension plugin function defined, if we test it with curl we have:
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

Now we extend "/afterOriginal" endpoint with a plugin. To do it we write a plugin function in extend.js 
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

now shutdown and restart your application (or invoke apiextender.install) to apply plugin function extension and make the same test with curl. You can see that original endpoint
is extended by plugin function:
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
With no extension plugin function defined, if we test it with curl we have:
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

Now we extend "/before_afterOriginal" endpoint with a plugin. To do it we write a plugin function in extend.js 
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

now shutdown and restart your application (or invoke apiextender.install) to apply plugin function extension and make the same test with curl. You can see that original endpoint
is extended by plugin function:
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


#### <a name="exampleerror"></a>`Examples: extend throwing error`
With no extension plugin function defined, if we test it with curl we have:
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
Now we extend "/overrideOriginal" endpoint with a plugin. To do it we write a plugin function in extend.js. Starting from above 
example [`Examples:before mode`](#examplebefore) we edit the plugin function to throw an error if no username field is sent. 
```javascript
var plugins=[
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
    }
];
module.exports = plugins;
``` 

now shutdown and restart your application (or invoke apiextender.install) to apply plugin function extension and make a test with curl. You can see that original endpoint
is not executed after extension function if no username field is sent because "before extension function" stops execution with an error message to 
thr apiextender callback:
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


#### <a name="examplecomplete"></a>`Examples: A Complete Example of plugin extension`
With no extension plugin function defined, if we test it with curl we have:
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

Now we extend "....Original" endpoint with a plugin. To do it we write a plugin function in extend.js 
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

now shutdown and restart your application (or invoke apiextender.install) to apply plugin function extension and make the same test with curl. You can see that original endpoint
is extended by plugin function:
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



#### <a name="exampleonFly"></a>`Example: Extend API on the fly at runtime`
To extend an api on the fly as described in reference section [install(app,extender,save)](#install) we need to define an
endpoint that wrap apiextender install function. To do it add the fee code lines to you app.js:
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

With no extension plugin function defined, if we test it with curl we have:
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

Now we extend "overrideOriginal" endpoint with a plugin function installed on fly without define it in extend.js. we call 
"/installPlugin" end point in post method:
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

now **without shutdown** and restart your application make the same test with curl. You can see that original endpoint
is extended by plugin function:
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

### File Properties creation

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

Contributors
------------

Alessandro Romanino ([a.romanino@gmail.com](mailto:a.romanino@gmail.com))
Guido Porruvecchio ([guido.porruvecchio@gmail.com](mailto:guido.porruvecchio@gmail.com))