var plugin = require("../.././plugin/extend");
var responseinterceptor=require('responseinterceptor');
var async=require('async');
var fs = require('fs');

function LoadParams(params,req){
    var values={};
    params.forEach(function(element,index){
        values[element]=req[element];
    });

    return values;
}


function writeParams(params,req, beforeParams){

    if((typeof  params) ==="object"){
        async.eachOf(params, function(value,key, callback) {
            if(beforeParams)
                beforeParams[key]=value;
            req[key]=value;
        });
    }else{
        req.before=params;
    }
}


function setErrorResponse(res,err){
    var errorString="";
    switch(err.error_code) {
        case 400:
            errorString="Bad Request";
            break;

        case 401:
            errorString="Unauthorized";
            break;

        case 403:
            errorString="Forbidden";
            break;

        case 404:
            errorString="Not Found";
            break;

        case 409:
            errorString="Conflict";
            break;

        case 500:
            errorString="Internal Server Error";
            break;

        case 504:
            errorString="Gateway Timeout";
            break;

        default:
            errorString=err.error_code;
            break;
    }

    if((typeof err.error_message) === 'object')
        err.error_message=JSON.stringify(err.error_message);

    res.status(err.error_code).send({error:errorString, error_message:err.error_message});
}



function extendGet(app,method,ext) {
    method=method.toLocaleLowerCase();
    app[method](ext.resource, function(req,res,next) {
        var params= LoadParams(ext.params,req);

        if(ext.mode=="override") {
            ext.extender(params,null,null,function (err, val) {
                if(!err) {
                    res.send(val);
                }
                else{
                    setErrorResponse(res,err);
                }
            });
        } else if(ext.mode=="before") {
            ext.extender(params,null,null,function (err, val) {
                if(!err){
                    writeParams(val, req);
                    next();
                }else{
                    setErrorResponse(res,err);
                }
            });
        }else if(ext.mode=="after") {
            responseinterceptor.interceptOnFly(req,res,function(body,cType, request, clb){
                if(!(req.before_after_error==true)) {
                    ext.extender(params, body, cType, function (err, val) {
                        if (!err) {
                            clb(val);
                        } else {
                            req.before_after_error = true;
                            if((typeof err.error_message).indexOf("object")<0)
                                res.setHeader('content-type', 'text/javascript');
                            setErrorResponse(res,err);
                        }
                    });
                }else
                    clb(body);
            });
            next();
        } else if(ext.mode=="before_after") {

            ext.extender.before(params,null,null,function (err, val) {
                if(!err) {
                    writeParams(val, req, params);
                    next();
                }else{
                    req.before_after_error=true;
                    setErrorResponse(res,err);
                }
            });

            responseinterceptor.interceptOnFly(req,res,function(body,cType, request, clb){
                if(!(req.before_after_error==true)) {
                    ext.extender.after(params, body, cType, function (err, val) {
                        if (!err) {
                            clb(val);
                        } else {
                            req.before_after_error = true;
                            if((typeof err.error_message).indexOf("object")<0)
                                res.setHeader('content-type', 'text/javascript');
                            setErrorResponse(res,err);
                        }
                    });
                }else
                    clb(body);
            });
        }else next(); // do nothing
    });
}

exports.extend=function(app){
    async.eachSeries(plugin, function(ext, callback) {
        if( ext.enabled && (ext.enabled===true))
            extendGet(app,ext.method,ext);
        callback();
    });
};


function getErrorHandlers(app,error_map) {
    var route, stack;

    stack = app._router.stack;


    async.eachOfSeries(stack, function(layer,key, callback) {
        if (layer && layer.name == '<anonymous>' &&  layer.route == undefined)
            callback(key);
        else callback();

    }, function(err_map) {
        var error_handlers=null;
        if(err_map){
            error_handlers = stack.splice(err_map);
            app._router.stack=stack;
        }
        error_map(error_handlers);
    });
}


exports.install=function(app,extender,save){
    getErrorHandlers(app,function(error_handlers){
        extendGet(app,extender.method,extender);

        if(error_handlers)
            app._router.stack.push.apply(app._router.stack, error_handlers);

        if(save){
            plugin.push(extender);
            var functionToString="[\n";
            async.eachSeries(plugin,function(obj,callback){
                functionToString += "   {\n";
                functionToString += ("      \"resource\":\"") + obj.resource.toString() + "\",\n";
                functionToString += ("      \"method\":\"") + obj.method.toString() + "\",\n";
                functionToString += ("      \"mode\":\"") + obj.mode.toString() + "\",\n";
                functionToString +=  "      \"params\":[" ;
                obj.params.forEach(function (value) {
                    functionToString+="\"" + value.toString() + "\",";
                });
                if(obj.params.length>0) functionToString=functionToString.slice(0,-1);
                functionToString+="],\n";

                if(obj.extender && obj.extender.before) {
                    functionToString += ("      \"extender\":{\n");
                    functionToString += ("          \"before\":") + obj.extender.before.toString() + ",\n";
                    functionToString += ("          \"after\":") + obj.extender.after.toString() + "\n";
                    functionToString += ("      }\n");
                }else{
                    functionToString += ("      \"extender\":") + obj.extender.toString() + "\n";
                }
                functionToString += "   },\n";
                callback();
            },function(err){
                functionToString=functionToString.slice(0,-2); // remove , and \n
                functionToString+="\n]";
                var nfile='var express = require(\'express\');\n\r' +
                    '\n\r' +
                    'var plugins=' + functionToString + ';\n\r' +
                    'module.exports = plugins;';

                fs.writeFile("./plugin/extend.js", nfile, function(err) {
                    console.log("DONE:" + err);
                });
            });
        }
    });
};

/*
* <table><tbody>
 <tr><th align="left">Alessandro Romanino</th><td><a href="https://github.com/aromanino">GitHub/aromanino</a></td><td><a href="mailto:a.romanino@gmail.com">mailto:a.romanino@gmail.com</a></td></tr>
 <tr><th align="left">Guido Porruvecchio</th><td><a href="https://github.com/gporruvecchio">GitHub/porruvecchio</a></td><td><a href="mailto:guido.porruvecchio@gmail.com">mailto:guido.porruvecchio@gmail.com</a></td></tr>
 </tbody></table>



 * */
