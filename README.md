# apiextender
This module deals with to extend an API backend that adds a specific feature to an existing API as plugin(add-in, addin, add-on, addon). 
apiextender let to :
+   enable third-party developers to create abilities which extend an application
+   support easily adding new features

apiextender allow to extend your API with plugin techniques in a simple and fast and with few lines of code.

* [Installation](#installation) 
* [Using apiextender](#using)
* [make your environment capable to accept plugins functions](#folder)
* [Reference](#reference) 
* [How to write function that extends the "API"](#howto)
    * [File properties creation](#creation)
* [File properties population](#populate)

* [Loading production or dev or test parameters](#load)
* [Ovverride parameters from command line](#override)
* [Examples](#examples)
    

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
Plugin functions to extend API must be created in a folder named plugin in the home directory of your application.
In this folder a filename called extend.js contains an array of plugin functions. 

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

extend.js contains an array of plugin functions so now initialize it as an empty plugin function container.
Insert in the file this contents
```javascript
var plugins=[];
module.exports = plugins;
```

**to see how to write plugin function read the section [How to write function that extends the "API"](#howto)**

## <a name="reference"></a>Reference
### <a name="extend"></a>extend(app)` 
This is the function that allow to make your extensible "API". 
The param `app` is the application that you want extend.  

## <a name="howto"></a>How to write function that extends the "API" 
To extend an API endpoint you must populate the extend.js file and more specifically the array plugin containing a
list of functions that extends the "API".

### extend.js structure
extend.js is defined as:  
```javascript
var plugins=[];
module.exports = plugins;
```
`plugins=[{function_extension(s)}]` is an array of function_extension(s) object , where each function_extension(s) is a function extender.
function_extension(s) are defined as the example below:
```javascript
{
    "resource":"/resourceToExtend",
    "method":"GET",
    "mode":"override",
    "params":[query],
    "extender": function(req,body,cType,callback){
            callback(null,{"Content extension"});
    }
}
``` 

Next an example of extend.js plugin extension definition that extend "/resourceToExtend" and "/OtherresourceToExtend" resources
```javascript
var plugins=[{
                "resource":"/resourceToExtend",
                "method":"GET",
                "mode":"override",
                "params":[query],
                "extender": function(req,body,cType,callback){
                                callback(null,{"Content extension"});
                            }
             },
             
            {
                "resource":"/OtherresourceToExtend",
                "method":"GET",
                "mode":"before",
                "params":[query],
                "extender": function(req,body,cType,callback){
                                callback(null,{"Content extension"});
                            }
            },
]             
``` 

### function_extension(s) structure
function_extension(s) are defined as:
```javascript
{
    "resource":"/resourceToExtend",
    "method":"GET",
    "mode":"override",
    "params":[query],
    "extender": function(req,body,cType,callback){
            callback(null,{"Content extension"});
    }
}
``` 

where:
+   **resource**: A string containing the resource URI to Extend
+   **method**  : A string containing the the resource method to Extend
+   **mode**    : A string containing the mode on which the resource must be extended. There are four
              different possible mode values "override", "before", "after", "before_after" where:
    +   **override**: override the original endpoint definition.
    +   **before**  : the extension function is executed before the original endpoint definition.
    +   **after**: the extension function is executed after the original endpoint definition.
    +   **before_after**: the extension function is executed before and after the original endpoint definition.
+   **params**  : An array of strings containing the list or express "req" params to pass at the extender function 
+   **extender**: Extender function definition on which extend the endpoint. This function is called end executed by 
                  apiextender and is defined as:
                  **function(reqParams,content,contentType,callback)**
    +   **reqParams**   : An Object containing the express req params  defined in params field. For example if params=["query"]
                          it contains {query:QueryParams} where QueryParams==req.params.
    +   **content**     : Contains the content of the original endpoint response when "mode" param is set to "after" or "before_after"
                          It is "null" when mode is set to "override" or "before".
    +   **contentType** : String that describe the contentType in content. For example "application/json" , "text/html" , "text/css" ...
    +   **callback**    : callback function to apiextender. It must be called with two params error and newContent
                          **callback(error,newContent)**
        +   error : If an error occurs in your extender function you can throw it to apiexender set it as an object containing
                    two keys called **error_code** containing the http status code to send to the client(es 204, 400, 404, 500)
                    **error_message** containing a message to send to the client. 
                    If error is not null apiextender stops the request execution and send a response with this error.
        +   newContent : The new content to send to the client if the mode is set to "override", "after" or "before_after", or the content to
                         add to the express req request param 
    

License - "MIT License"
-----------------------

MIT License

Copyright (c) 2016 aromanino gporruvecchio

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