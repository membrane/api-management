const YAML = Meteor.npmRequire("js-yaml");
const HTTPS = Npm.require("https");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var basicAuth;

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}
/**
 * @return {null}
 */
function URISplitter(toSplit, segment){
    if(toSplit!=null)
        return toSplit.split("/")[segment];
    else return null;
}

function call(kinde, method, path, options, callback){
    if(kinde!= undefined && path !=undefined && method !=undefined && options!=undefined){
        if(kinde==="HTTP"){
            if(callback!=undefined) { //asynchronus http Request
                HTTP.call(method, path, options, function (error, res) {
                    callback(error, res);
                });
                return undefined;
            }
            else return HTTP.call(method, path, options); //synchronus http request
        } else if (kinde==="HTTPS"){
            var j = path.split("/");
            var arr = [];
            for(var i=3; i<j.length; i++){
                arr.push(path.split("/")[i]);
            }
            arr = "/"+arr.join("/");
            //if(path.split("/")[2]== undefined) return ;
            options.hostname= path.split("/")[2].split(":")[0];//'encrypted.google.com',
            options.port= path.split("/")[2].split(":")[1];
            options.path= arr;
            options.method= method;
            if(options.owncertificates===false || options.owncertificates===undefined) {
                options.key = settings.findOne({type: "key"}).value;
                options.cert = settings.findOne({type: "cert"}).value;
                options.ca = settings.findOne({type: "ca"}).value;
            }
            options.rejectUnauthorized=false;


            if(options.params!=undefined){
                var post_data = "value="+options.params.value;
                options.headers= {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': post_data.length
                };
            }


            //console.log(options);

            try{
                var req = HTTPS.request(options, Meteor.bindEnvironment(function(res) {
                    var body = [];
                    var e = undefined;

                    res.on("data", function(data){body.push(data); });
                    res.on('error',Meteor.bindEnvironment( function(err){
                        e= err;
                        throw "ERROR: "+err;
                    }));
                    res.on("end", Meteor.bindEnvironment(function(){
                        body = body.join("");
                        callback(e, body);
                    }));


                }));
                if(options.params!=undefined){
                    req.write("value="+options.params.value);
                    //console.log("value="+options.params.value);
                    //console.log(options.headers);
                }
                req.end();
            } catch(e){
                console.log("ERR:83 ",e);
            }
            return undefined;

        } else throw "kinde NIN {HTTP, HTTPS}";
    } else throw "please specify more parameter";
}

function settingsNOTundefinedANDNOTempty(type){
    return settings.findOne({type: type}) != undefined && settings.findOne({type: type}).value != "";
}

function cmp(el1, el2){
    if(el1==undefined && el2==undefined){
        return cmp;
    }
    else if(el2==undefined){
        return function(el){
            return el1 === el;
        }
    }
    else return el1===el2;
}
function buildurl(part1, part2, part3){
    if(part1==undefined && part2==undefined && part3==undefined){
        return buildurl;
    } else if (part3==undefined && part2==undefined){
        return function(part2, part3){
            return part1+part2+part3;
        }
    } else if(part3==undefined){
        return function(part3){
            return part1+part2+part3;
        }
    } else
        return part1+part2+part3;
}
function buildurlR(part1, part2, part3){
    if(part1==undefined && part2==undefined && part3==undefined){
        return buildurlR;
    } else if (part3==undefined && part2==undefined){
        return function(part2, part3){
            return part3+part2+part1;
        }
    } else if(part3==undefined){
        return function(part3){
            return part3+part2+part1;
        }
    } else
        return part3+part2+part1;
}

function editproperty(obj, property, value){
    if(value==undefined && property==undefined && obj==undefined) {
        return editproperty;
    }
    else if(value==undefined && property==undefined){
        return function(_property, _value){
            if(_value==undefined){
                return function(__value){
                    var newobj = obj;
                    newobj[_property] = __value;
                    return newobj;
                }
            }
            else{
                var newobj = obj;
                newobj[_property] = _value;
                return newobj;
            }
        }
    }
    else if(value==undefined){
        return function(value){
            var newobj = obj;
            newobj[property] = value;
            return newobj;
        }
    }
    else {
        var newobj = obj;
        newobj[property] = value;
        return newobj;
    }

}
function httpsORhttp(){
    var kind;
    if (settingsNOTundefinedANDNOTempty("key") && settingsNOTundefinedANDNOTempty("cert")&& settingsNOTundefinedANDNOTempty("ca"))
        kind = "HTTPS";
    else
        kind = "HTTP";
    return kind;
}
function getresultsbykind(kind, results){
    if(results==null) return null;
    if (kind == "HTTPS") {
        results  = JSON.parse(results);
    } else {
        results = JSON.parse(results.content);
    }
    return results;
}



function readservicesonchange() {
    var kind =httpsORhttp();

    var rer = [];
    var membrane;

    function foreachendpoint(ent) {
        var serviceProxy = URISplitter(ent.key, 3); //apiconfig
        var host = null, port = null;
        var comp;
        ent.nodes = ent.nodes.filter(function (en) {
            comp = cmp(URISplitter(en.key, 4));
            return comp("host") || comp("port");
        });
        ent.nodes.forEach(function (en) {
            if (URISplitter(en.key, 4) === "host") {
                host = (en.value == "null") ? "localhost" : en.value;
            } else if (URISplitter(en.key, 4) === "port") {
                port = en.value;
            }
        });

        if (URISplitter(host, 0) === "http:" || URISplitter(host, 0) === "https:")
            host = URISplitter(host, 2);

        var uri = buildurlR("/admin/rest/proxies?offset=0&max=1000", host + ":" + port);
        var re;
        if (settingsNOTundefinedANDNOTempty("membraneusername"))
            re = call("HTTP", "GET", uri(""), {auth: settings.findOne({type: "membraneusername"}).value + ":" + settings.findOne({type: "membranepassword"}).value});
        else
            re = call("HTTP", "GET", uri("http://"), {});

        re = JSON.parse(re.content);
        if (re.proxies != undefined) {
            re.proxies.forEach(function (en) {
                if (en.path == null) en.path = "";
                var obj = {
                    name: en.name,
                    membrane: membrane,
                    url: ("http://" + host + ":" + en.listenPort + en.path)
                };
                if (services.findOne(obj) == undefined) {
                    services.insert(editproperty(obj, "_id", Random.id()));
                }
                rer.push(services.findOne(obj)._id);
            });
        }


    }

    function foreachdir (entry) {
        membrane = URISplitter(entry.key, 2);
        entry.nodes = entry.nodes.filter(function (ent) {
            return URISplitter(ent.key, 3) === "endpoint" && ent.dir === true && ent.nodes != undefined;
        });
        entry.nodes.forEach(foreachendpoint);
    }

    function parsereults(err, results) {
        var d = getresultsbykind(kind, results);
        if (err == undefined && d.node.dir === true && d.node.nodes != undefined) {
            rer = [];
            d.node.nodes = d.node.nodes.filter(function (entry) {
                return entry.dir === true && entry.nodes != undefined
            });
            d.node.nodes.forEach(foreachdir);
            services.find().fetch().forEach(function (entry) {
                if (!isInArray(entry._id, rer)) Meteor.call("delservice", entry._id);
            });
        } else console.log("ERR:259 ",err);
    }

    function readsuccessfull(error, res){
        //?wait=true&recursive=true funktioniert nicht zusammen, deshalb geschachtelt.
        //console.log(error, res);
        call(kind, "GET", settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane?recursive=true", {}, parsereults);
        readservicesonchange();

    }

    if (settings.findOne({type: "etcdurl"}) != undefined) {
        call(kind, "GET", settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane?wait=true&recursive=true", {}, readsuccessfull);
    }
}


    Meteor.startup(function () {
        if (settings.findOne({type: "exportusername"}) != undefined && settings.findOne({type: "exportpassword"}) != undefined) basicAuth = new HttpBasicAuth(settings.findOne({type: "exportusername"}).value, settings.findOne({type: "exportpassword"}).value);
        if (settingsNOTundefinedANDNOTempty("exportusername"))basicAuth.protect(["/export"]);

        policies.find().observe({
            changed: function (res) {
                Meteor.call("changed");
            },
            added: function (res) {
                Meteor.call("changed");
            }
        });
        services.find().observe({
            changed: function (res) {
                Meteor.call("changed");
            },
            added: function (res) {
                Meteor.call("changed");
            }
        });
        subscriptions.find().observe({
            changed: function (res) {
                Meteor.call("changed");
            },
            added: function (res) {
                Meteor.call("changed");
            }
        });

        Meteor.call("readservices");
        readservicesonchange();
        fixtures();
    });

    Meteor.methods({
        chsettings: function (type, value) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                if (settings.findOne({type: type}) != undefined) {
                    var _id = settings.findOne({type: type})._id;
                    settings.update({_id: _id}, {$set: {value: value}});
                }
                else
                    settings.insert({_id: Random.id(), type: type, value: value});
                if (type === "exportusername" && settings.findOne({type: "exportusername"}) != undefined && settings.findOne({type: "exportpassword"}) != undefined) {
                    basicAuth = new HttpBasicAuth(settings.findOne({type: "exportusername"}).value, settings.findOne({type: "exportpassword"}).value);
                    if (settings.findOne({type: "exportusername"}).value != "")basicAuth.protect(["/export"]);
                    else basicAuth = null;

                }

            }

        },
        changed: function () {

            var kind =httpsORhttp();
            var ret = createYAMLobject();
            call(kind, "GET", settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane?recursive=true", {}, function (err, results) {
                if (err == undefined) {
                    var d=getresultsbykind(kind,results);
                    //console.log(d);
                    if (d.node.dir === true && d.node.nodes != undefined) d.node.nodes.forEach(function (entry) {
                        var url = URISplitter(entry.key, 2);
                        var key = settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane/" + url;

                        //console.log(key);
                        call(kind, 'PUT', buildurl(key, "/apiconfig/url", ""), {params: {value: "http://localhost:3000/export"}},
                            function (error, result) {
                                if (!!error) {
                                    console.log(error);
                                }
                            });

                        //console.log(buildurl(key, "/apiconfig/fingerprint", ""));
                        call(kind, 'PUT', buildurl(key, "/apiconfig/fingerprint", ""), {params: {value: SHA256(YAML.safeDump(ret))}},
                            function (error, result) {
                                if (!!error) {
                                    console.log(error);
                                }
                            });

                    });
                } else console.log("ERR:357 ",err);
            });


            ///*HTTP.get(key, {}, function(error, results){
            //    console.log(error, results);
            //})*/
        },
        insertservice: function (service) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                services.insert({
                    "name": service
                });
            }
        },
        readservices: function () {
            var kind = httpsORhttp();
            var rer = [];
            var rez = [];
            var membrane;
            function foreachserviceproxy(ent) {
                var serviceProxy = URISplitter(ent.key, 3); //apiconfig


                var host = null, port = null;

                ent.nodes.forEach(function (en) {

                    if (URISplitter(en.key, 4) === "host") {
                        if (en.value == "null") host = "http://localhost";
                        else host = en.value;
                    } else if (URISplitter(en.key, 4) === "port") {
                        port = en.value;
                    }


                });

                if (URISplitter(host, 0) === "http:" || URISplitter(host, 0) === "https:")
                    host = URISplitter(host, 2);


                try {
                    var url= buildurlR(port + "/admin/rest/proxies?offset=0&max=1000",host + ":")
                    if (settingsNOTundefinedANDNOTempty("membraneusername")) var re = call("HTTP", "GET",  url("") , {auth: settings.findOne({type: "membraneusername"}).value + ":" + settings.findOne({type: "membranepassword"}).value});
                    else  var re = call("HTTP", "GET", url("http://"), {});

                    re = JSON.parse(re.content);
                    var membraneobj = {
                        name: membrane,
                        host: host,
                        port: port
                    };
                    if (membranes.findOne(membraneobj) == undefined) {
                        membranes.insert(editproperty(membraneobj, "_id", Random.id()));
                    }
                    var mem = membranes.findOne(membraneobj);
                    rez.push(mem._id);

                    if (re.proxies != undefined) {
                        re.proxies.forEach(function (en) {
                            if (en.path == null) en.path = "";
                            var serviceobj = {
                                name: en.name,
                                membrane: membrane,
                                url: ("http://" + host + ":" + en.listenPort + en.path)
                            };
                            if (services.findOne(serviceobj) == undefined) {
                                services.insert(editproperty(serviceobj, "_id", Random.id())); //Random.id()
                            }
                            rer.push(services.findOne(serviceobj)._id);
                        });
                    }
                } catch (e) {
                    console.log("ERR:431 ", e);
                }
            }

            function foreachmembrane(entry) {
                membrane = URISplitter(entry.key, 2);
                var serviceProxy;
                entry.nodes = entry.nodes.filter(function (ent) {
                    serviceProxy = URISplitter(ent.key, 3);
                    return serviceProxy === "endpoint" && ent.dir === true && ent.nodes != undefined;
                });
                entry.nodes.forEach(foreachserviceproxy);
            }
            if (settings.findOne({type: "etcdurl"}) != undefined)
                call(kind, "GET", settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane?recursive=true", {}, function (err, results) {
                    if (err == undefined) {
                        var d = getresultsbykind(kind, results);


                        if (d.node.dir === true && d.node.nodes != undefined) {
                            d.node.nodes = d.node.nodes.filter(function (entry) {
                                return entry.dir === true && entry.nodes != undefined;
                            });
                            d.node.nodes.forEach(foreachmembrane);
                        }

                        //console.log(rez);
                        membranes.find().fetch().forEach(function (entry) {
                            if (!isInArray(entry._id, rez)) Meteor.call("delmembrane", entry._id);
                        });
                        services.find().fetch().forEach(function (entry) {
                            if (!isInArray(entry._id, rer)) Meteor.call("delservice", entry._id);
                        });
                    } else console.log("ERR:464 ",err);
                });

        },
        delmembrane: function (membraneid) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                membranes.remove({_id: membraneid});
            }
        },
        deleteuser: function (userid) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Meteor.users.remove({_id: userid});
            }
        },
        setpassword: function (userid, newPassword) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Accounts.setPassword(userid, newPassword);
            }
        },
        createuser: function (emailVar, passwordVar, surnameVar, firstnameVar) {
            if (Meteor.users.findOne() != undefined) {
                var id = Accounts.createUser({
                    email: emailVar,
                    password: passwordVar,
                    profile: {
                        surname: surnameVar,
                        firstname: firstnameVar,
                        status: "unapproved"
                    }
                });
                Meteor.users.update({"_id": id}, {$set: {"roles": ["evaluation"]}});
            }else{
                var id = Accounts.createUser({
                    email: emailVar,
                    password: passwordVar,
                    profile: {
                        surname: surnameVar,
                        firstname: firstnameVar,
                        status: "approved"
                    }
                });
                Meteor.users.update({"_id":id}, {$set:{"roles": ["admin"] }});
                if(groups.findOne()==undefined)groups.insert({_id:Random.id(), name:"admin"});
            }

        },
        createnewuser: function (firstname, surname, email, password) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                var id=Accounts.createUser({
                    email: email,
                    password: password,
                    profile: {
                        surname: surname,
                        firstname: firstname,
                        status: "approved"
                    }
                });
                Meteor.users.update({"_id":id}, {$set:{"roles": ["evaluation"] }});
            }
        },
        altergroups: function(userid, groups){
            console.log(userid, groups);
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Meteor.users.update({_id: userid}, {$set: {roles: groups}});
            }
        },
        alterstatus: function (userid, newstatus) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Meteor.users.update({_id: userid}, {$set: {"profile.status": newstatus}});
            }
        },
        alterfirstname: function (userid, firstname) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Meteor.users.update({_id: userid}, {$set: {"profile.firstname": firstname}});
            }
        },
        altersurname: function (userid, surname) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Meteor.users.update({_id: userid}, {$set: {"profile.surname": surname}});
            }
        },
        alteremail: function (userid, mail) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Meteor.users.update({_id: userid}, {$set: {"emails.0.address": mail}});
            }
        },
        addgroup: function (userid, group) {
            if (Roles.userIsInRole(this.userId, ['admin']) && !Roles.userIsInRole(userid, group)) {
                Meteor.users.update({_id: userid}, {$push: {roles: group}});
            }
        },
        addlgroup: function (group) {
            if (Roles.userIsInRole(this.userId, ['admin']) && (groups.findOne({name: group}) == undefined)) {
                groups.insert({_id: Random.id(), name: group});
            }
        },
        delgroup: function (userid, group) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Meteor.users.update({_id: userid}, {$pull: {roles: group}});
            }
        },
        dellgroup: function (group) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                groups.remove({name: group});
                var user = Meteor.users.find().fetch();
                user.forEach(function (entry) {
                    Meteor.users.update({_id: entry._id}, {$pull: {roles: group}});
                });


                var obj = null;
                policies.find().fetch().forEach(function (entry) {
                    entry.groups.forEach(function (ent) {
                        if (ent.name === group) obj = ent;
                    });
                });
                if (obj != null) policies.update(
                    {},
                    {
                        $pullAll: {
                            groups: [
                                {
                                    _id: obj._id,
                                    type: obj.type,
                                    name: obj.name
                                }
                            ]
                        }
                    },
                    {multi: true}
                );

            }
        },
        delpolicy: function (policyid) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                policies.remove({_id: policyid});
                subscriptions.remove({policy: policyid});
            }
        },
        delservice: function (serviceid) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {

                services.remove({_id: serviceid});
                var pol = policies.find().fetch();
                var obj = null;
                pol.forEach(function (entry) {
                    entry.services.forEach(function (ent) {
                        if (ent._id === serviceid) obj = ent;
                    });
                });
                //if (obj != null)policies.find().fetch().forEach(function (entry){
                //    policies.update({_id: entry._id}, {
                //        $pullAll: {
                //            services:
                //                [{
                //                    _id: serviceid,
                //                    type: obj.type,
                //                    name: obj.name
                //                }]
                //
                //        }
                //    }, {multi:true});
                //});
                if (obj != null)
                    policies.update({}, {
                        $pullAll: {
                            services: [{
                                _id: serviceid,
                                type: obj.type,
                                name: obj.name
                            }]

                        }
                    }, {multi: true});

            }
        },
        setstatus: function (userid, status) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Meteor.users.update({_id: userid}, {$set: {"profile.status": status}});
            }
        },
        insertsubscription: function (userid, policy, key) {
            if (this.userId === userid) {
                var id = [];
                policies.find().fetch().forEach(function (entry) {
                    entry.groups.forEach(function (ent) {
                        if (isInArray(ent.name, Roles.getRolesForUser(userid))) {
                            id.push(entry._id);
                        }
                    });
                });

                if (id.indexOf(policy) > -1) {
                    if (subscriptions.find({
                            policy: policy,
                            user: userid
                        }).fetch().length === 0){
                        if(policies.findOne({_id: policy}).expires!="never")
                            subscriptions.insert({
                                _id: Random.id(),
                                policy: policy,
                                user: userid,
                                key: key,
                                expires: getdate(policies.findOne({_id: policy}).expires)
                            });
                        else
                            subscriptions.insert({
                                _id: Random.id(),
                                policy: policy,
                                user: userid,
                                key: key,
                                expires: "never",
                            });

                    }

                }
            } else if (Roles.userIsInRole(this.userId, ['admin']))
                subscriptions.insert({
                    _id: Random.id(),
                    policy: policy,
                    user: userid,
                    key: key
                });
        },
        //altersubscriptionkey: function(subscriptionid, key) {
        //    sub = subscriptions.findOne({_id: subscriptionid});
        //    if (sub != undefined) {
        //        if (this.userId === sub.user) {
        //            policy = sub.policy;
        //            id = [];
        //            userid = this.userId;
        //            catalogues.find().fetch().forEach(function (entry) {
        //                entry.groups.forEach(function (ent) {
        //                    if (isInArray(ent.name, Roles.getRolesForUser(userid))) {
        //                        id.push(entry._id);
        //                    }
        //                });
        //            });
        //
        //            cat = catalogues.find({_id: {$in: id}}).fetch();
        //            id = [];
        //            cat.forEach(function (entry) {
        //                entry.policies.forEach(function (ent) {
        //                    id.push(ent._id);
        //                });
        //            });
        //            if (id.indexOf(policy) > -1) {
        //                if (subscriptions.find({
        //                        policy: policy,
        //                        user: userid
        //                    }).fetch().length > 0)
        //                    subscriptions.update({_id: subscriptionid}, {$set: {key: key}});
        //            }
        //        }
        //
        //    } else if (Roles.userIsInRole(this.userId, ['admin']))
        //        subscriptions.update({_id: subscriptionid}, {$set: {key: key}});
        //}
        //,
        delsubscription: function (subscriptionid) {
            var sub = subscriptions.findOne({_id: subscriptionid});

            if (sub == undefined)
                return;
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                subscriptions.remove({_id: subscriptionid});
            } else if (this.userId === sub.user) {
                var policy = sub.policy;
                var id = [];
                var userid = this.userId;
                policies.find().fetch().forEach(function (entry) {
                    entry.groups.forEach(function (ent) {
                        if (isInArray(ent.name, Roles.getRolesForUser(userid))) {
                            id.push(entry._id);
                        }
                    });
                });

                //console.log(JSON.stringify(cats));
                //
                //id = cats.map(function (cat) { return cat.policies; }).map(function (policy) {
                //        return policy._id;
                //    });
                //console.log(JSON.stringify(id));

                if (id.indexOf(policy) > -1) {
                    if (subscriptions.find({
                            policy: policy,
                            user: userid
                        }).fetch().length > 0)
                        subscriptions.remove({_id: subscriptionid});
                }
            }


        },
        //,
        userstatus: function (id) {
            if(Meteor.users.findOne({_id: id})!=undefined)
                return Meteor.users.findOne({_id: id}).profile.status;
            else return undefined;
        },
        getyamldata: function (obj) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                //console.log(YAML.safeDump(JSON.stringify(obj)));
                return YAML.safeDump(JSON.parse(JSON.stringify(obj)));
            }
        },
        writedatatofile: function (obj, file) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                fs.writeFile(file, obj, function (err) {
                    if (err) {
                        return console.error(err);
                    }
                });
            }
        }

    });

    Accounts.validateLoginAttempt(function (info) {
        var user = info.user;
        if (user == undefined) return false;

        if (user.profile != undefined) {
            return user.profile.status == "approved";
        }
        else return false;


    });

    membranes.allow({
        update: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        insert: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        remove: function (userId, doc, fields, modifier) {
            return  (Roles.userIsInRole(userId, ['admin']));
        }
    });
    Meteor.publish('membranes', function () {
        if (Roles.userIsInRole(this.userId, ['admin'])) return membranes.find();
        else return null;
    });

    settings.allow({
        update: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        insert: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        remove: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        }
    });
    Meteor.publish('settings', function () {
        if (Roles.userIsInRole(this.userId, ['admin'])) return settings.find();
        else return null;//settings.find({type:"fixtures"});
    });

    policies.allow({
        update: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        insert: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        remove: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        }
    });
    Meteor.publish('policies', function () {
        if (Roles.userIsInRole(this.userId, ['admin'])) return policies.find();
        else {
            var userid = this.userId;
            var id = [];
            policies.find().fetch().forEach(function (entry) {
                entry.groups.forEach(function (ent) {
                    if (isInArray(ent.name, Roles.getRolesForUser(userid))) {
                        id.push(entry._id);
                    }
                });
                if(entry.unauthenticated) id.push(entry._id);
            });
            return policies.find({_id: {$in: id}});
        }
    });

    services.allow({
        update: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        insert: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        remove: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        }
    });
    Meteor.publish('services', function (name) {
        if (Roles.userIsInRole(this.userId, ['admin']))return services.find();
        else {
            //console.log(Roles.getRolesForUser( this.userId ));
            var id = [];
            var userid = this.userId;
            policies.find().fetch().forEach(function (entry) {
                entry.groups.forEach(function (ent) {
                    if (isInArray(ent.name, Roles.getRolesForUser(userid))) {
                        id.push(entry._id);
                    }
                });
                if(entry.unauthenticated) id.push(entry._id);
                //console.log(entry);
            });
            var pol = policies.find({_id: {$in: id}}).fetch();
            var id = [];
            pol.forEach(function (entry) {
                entry.services.forEach(function (ent) {
                    id.push(ent._id);
                });
            });
            return services.find({_id: {$in: id}}, {fields: {name: 1, _id: 1, url: 1, membrane: 1}});
        }
    });
    subscriptions.allow({
        update: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        insert: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        },
        remove: function (userId, doc, fields, modifier) {
            return (Roles.userIsInRole(userId, ['admin']));
        }
    });
    Meteor.publish('subscriptions', function () {
        if (Roles.userIsInRole(this.userId, ['admin']))return subscriptions.find();
        else {
            return subscriptions.find({user: this.userId});
        }
    });
    Meteor.publish('groups', function () {
        if (Roles.userIsInRole(this.userId, ['admin']))return groups.find();
        else {
            return groups.find({_id: {$in: Roles.getRolesForUser(this.userId)}});
        }
    });

    Meteor.publish('UserAccounts', function () {


        if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Meteor.users.find({}, {
                fields: {
                    emails: 1,
                    profile: 1,
                    roles: 1
                }
            });
        }
        else if(this.userId){
            return Meteor.users.find(this.userId, {
                fields: {
                    emails: 1,
                    profile: 1,
                    roles: 1
                }
            });
        } else return Meteor.users.find({ "emails.address" : 'admin@example.com' }, {
            fields: {
                emails: 1
            }
        });
    });
