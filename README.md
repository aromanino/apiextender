# apiextender
This module deals with to extend an API backend that adds a specific feature to an existing API as plugin(add-in, addin, add-on, addon).   
apiextender let to :
+   enable third-party developers to create abilities which extend an application
+   support easily adding new features

**apiextender** allow to extend your API with plugin techniques in a **simple and fast** and with **few lines of code**.

* [Installation](#installation) 
* [Using apiextender](#using)
* [Reference](#reference) 
    * [extend(app)](#extend)
* [make your environment capable to accept plugins functions](#folder)
* [How to write function that extends the "API"](#howto)
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

## <a name="reference"></a>Reference
### <a name="extend"></a>`extend(app)` 
This is the function that allow to make your "API" extensible. 
The param `app` is the application that you want extend.  


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

### function_extension(s) structure
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
    

####<a name="nb"></a> `NB`: If mode is set to "before_after", is mandatory to declare in extender param two function, one for actions "before" and one other for actions "after". So the "**extender**" parameter is not a declaration function but an object containing two keys: 
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


## <a name="examples"></a>`Examples`

### File Properties creation

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