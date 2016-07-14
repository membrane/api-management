
fixtures = function(){
    if(Meteor.users.findOne()==undefined) {
        var id = Accounts.createUser({
            email: "admin@example.com",
            password: "admin",
            profile: {
                surname: "admin",
                firstname: "admin",
                status: "approved"
            }
        });
        Meteor.users.update({"_id":id}, {$set:{"roles": ["admin"] }});
    }
    if(groups.findOne()==undefined){
        groups.insert({_id:Random.id(), name:"admin"});
        groups.insert({_id:Random.id(), name:"evaluation"});
        groups.insert({_id:Random.id(), name:"users"});
        groups.insert({_id:Random.id(), name:"testers"});
    }
    if(settings.findOne({type: "etcdurl"}) == undefined){
        settings.insert({_id: Random.id(), type: "etcdurl", value: "http://localhost:2379"});
    }
    if(settings.findOne({type: "hostname"}) == undefined){
        settings.insert({_id: Random.id(), type: "hostname", value: OS.hostname()});
    }
};