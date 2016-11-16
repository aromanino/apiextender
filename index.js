var plugin = require("../.././plugin/extend");
var responseinterceptor=require('responseinterceptor');
var async=require('async');

function LoadParams(params,req){
    var values={};
    params.forEach(function(element,index){
        values[element]=req[element];
    });

    return values;
}


function writeParams(params,req){

    if((typeof  params) ==="object"){
        async.eachOf(params, function(value,key, callback) {
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

            ext.extender[0](params,null,null,function (err, val) {
                if(!err) {
                    writeParams(val, req);
                }else{
                    res.status(err.error_code).send(err.error_message);
                }
            });

            responseinterceptor.interceptOnFly(req,res,function(body,cType, request, clb){
                ext.extender[1](params,body,cType,function (err, val) {
                    if(!err) {
                        clb(val);
                    }else{
                        res.status(err.error_code).send(err.error_message);
                    }
                });
            });

            next();

        }else next(); // do nothing
    });
}

exports.extend=function(app){
    async.eachSeries(plugin, function(ext, callback) {
        extendGet(app,ext.method,ext);
        callback();
    });
}


