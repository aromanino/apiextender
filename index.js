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
                    res.status(err.error_code).send(err.error_message);
                }
            });
        } else if(ext.mode=="before") {
            ext.extender(params,null,null,function (err, val) {
                if(!err){
                    writeParams(val, req);
                    next();
                }else{
                    res.status(err.error_code).send(err.error_message);
                }
            });
        }else if(ext.mode=="after") {
            responseinterceptor.interceptOnFly(req,res,function(body,cType, request, clb){
                ext.extender(params,body,cType,function (err, val) {
                    if(!err) {
                        clb(val);
                    }else{
                        res.status(err.error_code).send(err.error_message);
                    }
                });
            });
            next();
        } else if(ext.mode=="before_after") {

            ext.extender.before(params,null,null,function (err, val) {
                if(!err) {
                    writeParams(val, req, params);
                    next();
                }else{
                    res.status(err.error_code).send(err.error_message);
                }
            });

            responseinterceptor.interceptOnFly(req,res,function(body,cType, request, clb){
                ext.extender.after(params,body,cType,function (err, val) {
                    if(!err) {
                        clb(val);
                    }else{
                        res.status(err.error_code).send(err.error_message);
                    }
                });
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
