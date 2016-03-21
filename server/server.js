const YAML = Meteor.npmRequire("js-yaml");
const HTTPS = Npm.require("https");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var basicAuth;

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}
function URISplitter(toSplit, segment){
    if(toSplit!=null)
        return toSplit.split("/")[segment];
    else return null;
}

function call(kinde, method, path, options, callback){
    if(kinde!= undefined && path !=undefined && method !=undefined, options!=undefined){
        if(kinde==="HTTP"){
            if(callback!=undefined) {
                HTTP.call(method, path, options, function (error, res) {
                    callback(error, res);
                });
                return undefined;
            }

            else return HTTP.call(method, path, options);
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
                post_data = "value="+options.params.value;
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
                console.log(e);
            }
            return undefined;

        } else throw "kinde NIN {HTTP, HTTPS}";
    } else throw "please specify more parameter";
}

function readservicesonchange() {
    if (settings.findOne({type: "key"}) != undefined &&
        settings.findOne({type: "cert"}) != undefined &&
        settings.findOne({type: "ca"}) != undefined &&
        settings.findOne({type: "key"}).value != "" &&
        settings.findOne({type: "cert"}).value != "" &&
        settings.findOne({type: "ca"}).value != "")
        var kind = "HTTPS";
    else var kind = "HTTP";
    if (settings.findOne({type: "etcdurl"}) != undefined) {
        call(kind, "GET", settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane?wait=true&recursive=true", {}, function (error, res) {
            //?wait=true&recursive=true funktioniert nicht zusammen, deshalb geschachtelt.
            //console.log(error, res);
            call(kind, "GET", settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane?recursive=true", {}, function (err, results) {
                if (err == undefined) {
                    if (kind == "HTTPS") {
                        var d = JSON.parse(results);
                    } else {
                        var d = JSON.parse(results.content);
                    }
                    var rer = [];
                    if (d.node.dir === true && d.node.nodes != undefined) d.node.nodes.forEach(function (entry) {
                        membrane = URISplitter(entry.key, 2);
                        if (entry.dir === true && entry.nodes != undefined) entry.nodes.forEach(function (ent) {
                            serviceProxy = URISplitter(ent.key, 3); //apiconfig
                            if (serviceProxy === "endpoint" && ent.dir === true && ent.nodes != undefined) {
                                var host = null, port = null;
                                ent.nodes.forEach(function (en) {

                                    if (URISplitter(en.key, 4) === "host") {
                                        if (en.value == "null") host = "localhost";
                                        else host = en.value;
                                    } else if (URISplitter(en.key, 4) === "port") {
                                        port = en.value;
                                    }


                                });

                                if (URISplitter(host, 0) === "http:" || URISplitter(host, 0) === "https:")
                                    host = URISplitter(host, 2);

                                try {

                                    if (settings.findOne({type: "membraneusername"}) != undefined && settings.findOne({type: "membraneusername"}).value != "") var re = call("HTTP", "GET", host + ":" + port + "/admin/rest/proxies?offset=0&max=1000", {auth: settings.findOne({type: "membraneusername"}).value + ":" + settings.findOne({type: "membranepassword"}).value});
                                    else  var re = call("HTTP", "GET", "http://" + host + ":" + port + "/admin/rest/proxies?offset=0&max=1000", {});

                                    re = JSON.parse(re.content);
                                    if (re.proxies != undefined) {
                                        re.proxies.forEach(function (en) {
                                            if (en.path == null) en.path = "";
                                            if (services.findOne({
                                                    name: en.name,
                                                    membrane: membrane,
                                                    url: ("http://" + host + ":" + en.listenPort + en.path)
                                                }) == undefined) {
                                                services.insert({
                                                    _id: en.name,
                                                    name: en.name,
                                                    membrane: membrane,
                                                    url: ("http://" + host + ":" + en.listenPort + en.path)
                                                });
                                            }
                                            rer.push(services.findOne({
                                                name: en.name,
                                                membrane: membrane,
                                                url: ("http://" + host + ":" + en.listenPort + en.path)
                                            })._id);
                                        });
                                    }
                                } catch (e) {
                                    console.log("ERROR", e);
                                }

                            }


                        });
                    });
                    services.find().fetch().forEach(function (entry) {
                        if (!isInArray(entry._id, rer)) Meteor.call("delservice", entry._id);
                    });
                } else console.log(err);
            });
            readservicesonchange();
        });
    }
}


    Meteor.startup(function () {
        if (settings.findOne({type: "exportusername"}) != undefined && settings.findOne({type: "exportpassword"}) != undefined) basicAuth = new HttpBasicAuth(settings.findOne({type: "exportusername"}).value, settings.findOne({type: "exportpassword"}).value);
        if (settings.findOne({type: "exportusername"}) != undefined && settings.findOne({type: "exportusername"}).value != "")basicAuth.protect(["/export"]);

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
                if (type === "exportusername") {
                    basicAuth = new HttpBasicAuth(settings.findOne({type: "exportusername"}).value, settings.findOne({type: "exportpassword"}).value);
                    if (settings.findOne({type: "exportusername"}).value != "")basicAuth.protect(["/export"]);
                    else basicAuth = null;
                    console.log(basicAuth);
                }

            }

        },
        changed: function () {

            if (settings.findOne({type: "key"}) != undefined &&
                settings.findOne({type: "cert"}) != undefined &&
                settings.findOne({type: "ca"}) != undefined &&
                settings.findOne({type: "key"}).value != "" &&
                settings.findOne({type: "cert"}).value != "" &&
                settings.findOne({type: "ca"}).value != "")
                var kind = "HTTPS";
            else var kind = "HTTP";
            pol = policies.find().fetch();
            ret = {policies: [], keys: []};
            pol.forEach(function (entry) {
                rez = [];
                entry.services.forEach(function (ent) {
                    if (ent != undefined)rez.push(ent.name.toString());
                });
                if (entry != undefined)ret.policies.push({
                    policy: {
                        id: entry.name,
                        rateLimit: entry.rateLimit,
                        quota: entry.quota,
                        serviceProxy: rez
                    }
                })
            });
            sub = subscriptions.find().fetch();
            sub.forEach(function (entry) {
                rez = [];
                if (policies.findOne({_id: entry.policy}) != undefined) rez.push(policies.findOne({_id: entry.policy}).name);
                ret.keys.push({key: entry.key, policies: rez})
            });

            call(kind, "GET", settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane?recursive=true", {}, function (err, results) {
                if (err == undefined) {
                    if (kind == "HTTPS") {
                        var d = JSON.parse(results);
                    } else {
                        var d = JSON.parse(results.content);
                    }
                    //console.log(d);
                    var rer = [];
                    if (d.node.dir === true && d.node.nodes != undefined) d.node.nodes.forEach(function (entry) {
                        var url = URISplitter(entry.key, 2);
                        var key = settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane/" + url + "/apiconfig/url";
                        //console.log(key);
                        call(kind, 'PUT', key, {params: {value: "http://localhost:3000/export"}},
                            function (error, result) {
                                if (!!error) {
                                    console.log(error);
                                }
                            });

                        key = settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane/" + url + "/apiconfig/fingerprint";
                        //console.log(key);
                        call(kind, 'PUT', key, {params: {value: SHA256(YAML.safeDump(ret))}},
                            function (error, result) {
                                if (!!error) {
                                    console.log(error);
                                }
                            });

                    });
                }
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
            if (settings.findOne({type: "key"}) != undefined &&
                settings.findOne({type: "cert"}) != undefined &&
                settings.findOne({type: "ca"}) != undefined &&
                settings.findOne({type: "key"}).value != "" &&
                settings.findOne({type: "cert"}).value != "" &&
                settings.findOne({type: "ca"}).value != "")
                var kind = "HTTPS";
            else var kind = "HTTP";
            if (settings.findOne({type: "etcdurl"}) != undefined)
                call(kind, "GET", settings.findOne({type: "etcdurl"}).value + "/v2/keys/membrane?recursive=true", {}, function (err, results) {
                    if (err == undefined) {
                        if (kind === "HTTPS") var d = JSON.parse(results);
                        else var d = JSON.parse(results.content);
                        var rer = [];
                        var rez = [];
                        if (d.node.dir === true && d.node.nodes != undefined) d.node.nodes.forEach(function (entry) {
                            membrane = URISplitter(entry.key, 2);

                            if (entry.dir === true && entry.nodes != undefined) entry.nodes.forEach(function (ent) {
                                serviceProxy = URISplitter(ent.key, 3); //apiconfig

                                if (serviceProxy === "endpoint" && ent.dir === true && ent.nodes != undefined) {
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

                                        if (settings.findOne({type: "membraneusername"}) != undefined && settings.findOne({type: "membraneusername"}).value != "") var re = call("HTTP", "GET", host + ":" + port + "/admin/rest/proxies?offset=0&max=1000", {auth: settings.findOne({type: "membraneusername"}).value + ":" + settings.findOne({type: "membranepassword"}).value});
                                        else  var re = call("HTTP", "GET", "http://" + host + ":" + port + "/admin/rest/proxies?offset=0&max=1000", {});

                                        re = JSON.parse(re.content);
                                        if (membranes.findOne({
                                                name: membrane,
                                                host: host,
                                                port: port
                                            }) == undefined) {
                                            membranes.insert({
                                                _id: Random.id(),
                                                name: membrane,
                                                host: host,
                                                port: port
                                            });
                                        }
                                        mem = membranes.findOne({
                                            name: membrane,
                                            host: host,
                                            port: port
                                        });
                                        rez.push(mem._id);

                                        if (re.proxies != undefined) {
                                            re.proxies.forEach(function (en) {
                                                if (en.path == null) en.path = "";
                                                if (services.findOne({
                                                        name: en.name,
                                                        membrane: membrane,
                                                        url: ("http://" + host + ":" + en.listenPort + en.path)
                                                    }) == undefined) {
                                                    services.insert({
                                                        _id: en.name,
                                                        name: en.name,
                                                        membrane: membrane,
                                                        url: ("http://" + host + ":" + en.listenPort + en.path)
                                                    });
                                                }
                                                rer.push(services.findOne({
                                                    name: en.name,
                                                    membrane: membrane,
                                                    url: ("http://" + host + ":" + en.listenPort + en.path)
                                                })._id);
                                            });
                                        }
                                    } catch (e) {
                                        console.log("Error: dsd", e);
                                    }

                                }


                            });
                        });
                        //console.log(rez);
                        membranes.find().fetch().forEach(function (entry) {
                            if (!isInArray(entry._id, rez)) Meteor.call("delmembrane", entry._id);
                        });
                        services.find().fetch().forEach(function (entry) {
                            if (!isInArray(entry._id, rer)) Meteor.call("delservice", entry._id);
                        });
                    } else console.log(err);
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
            Accounts.createUser({
                email: emailVar,
                password: passwordVar,
                profile: {
                    surname: surnameVar,
                    firstname: firstnameVar,
                    status: "unapproved"
                },
                roles: []
            });
        },
        createnewuser: function (firstname, surname, email, password) {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                Accounts.createUser({
                    email: email,
                    password: password,
                    profile: {
                        surname: surname,
                        firstname: firstname,
                        status: "waiting"
                    },
                    roles: []
                });
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
                user = Meteor.users.find().fetch();
                user.forEach(function (entry) {
                    Meteor.users.update({_id: entry._id}, {$pull: {roles: group}});
                });


                obj = null;
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
                pol = policies.find().fetch();
                obj = null;
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
                id = [];
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
                        }).fetch().length === 0)
                        subscriptions.insert({
                            _id: Random.id(),
                            policy: policy,
                            user: userid,
                            key: key
                        });
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
            sub = subscriptions.findOne({_id: subscriptionid});

            if (sub == undefined)
                return;

            if (this.userId === sub.user) {
                policy = sub.policy;
                id = [];
                userid = this.userId;
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
            } else if (Roles.userIsInRole(this.userId, ['admin'])) {
                subscriptions.remove({_id: subscriptionid});
            }


        },
        //,
        userstatus: function (id) {
            return Meteor.users.findOne({_id: id}).profile.status;
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
            if (user.profile.status != "approved") return false;
            else return true;
        }
        else return false;


    });

    membranes.allow({
        update: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        insert: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        remove: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        }
    });
    Meteor.publish('membranes', function () {
        if (Roles.userIsInRole(this.userId, ['admin'])) return membranes.find();
        else return null;
    });

    settings.allow({
        update: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        insert: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        remove: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        }
    });
    Meteor.publish('settings', function () {
        if (Roles.userIsInRole(this.userId, ['admin'])) return settings.find();
        else return null;
    });

    policies.allow({
        update: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        insert: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        remove: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        }
    });
    Meteor.publish('policies', function () {
        if (Roles.userIsInRole(this.userId, ['admin'])) return policies.find();
        else {
            userid = this.userId;
            id = [];
            policies.find().fetch().forEach(function (entry) {
                entry.groups.forEach(function (ent) {
                    if (isInArray(ent.name, Roles.getRolesForUser(userid))) {
                        id.push(entry._id);
                    }
                });
            });
            return policies.find({_id: {$in: id}});
        }
    });

    services.allow({
        update: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        insert: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        remove: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        }
    });
    Meteor.publish('services', function (name) {
        if (Roles.userIsInRole(this.userId, ['admin']))return services.find();
        else {
            //console.log(Roles.getRolesForUser( this.userId ));
            id = [];
            userid = this.userId;
            policies.find().fetch().forEach(function (entry) {
                entry.groups.forEach(function (ent) {
                    if (isInArray(ent.name, Roles.getRolesForUser(userid))) {
                        id.push(entry._id);
                    }
                });
            });
            pol = policies.find({_id: {$in: id}}).fetch();
            id = [];
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
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        insert: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
        },
        remove: function (userId, doc, fields, modifier) {
            if (Roles.userIsInRole(userId, ['admin']))
                return true;
            else
                return false;
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

        if (!this.userId) return null;
        else if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Meteor.users.find({}, {
                fields: {
                    emails: 1,
                    profile: 1,
                    roles: 1
                }
            });
        }
        else {
            return Meteor.users.find(this.userId, {
                fields: {
                    emails: 1,
                    profile: 1,
                    roles: 1
                }
            });
        }
    });
