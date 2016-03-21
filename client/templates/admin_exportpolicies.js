Meteor.subscribe("policies");

Template.admin_exportpolicies.helpers({
    policies: function(){
        pol= policies.find().fetch();
        ret = {policies: [], keys: []};
        pol.forEach(function(entry){
            rez= [];
            entry.services.forEach(function(ent){
                if(ent!=undefined)rez.push(ent.name.toString());
            });
            if(entry!=undefined)ret.policies.push({policy : { id: entry.name, rateLimit: entry.rateLimit, quota: entry.quota, serviceProxy: rez}})
        });
        sub = subscriptions.find().fetch();
        sub.forEach(function(entry) {
            rez =[];
            if(policies.findOne({_id:entry.policy})!=undefined) rez.push(policies.findOne({_id:entry.policy}).name);
            ret.keys.push({key: entry.key, policies: rez})
        });

        Meteor.call("getyamldata", ret, function(err, res){
            if(err==undefined) Session.set("results", res);
        });
        Meteor.call("writedatatofile", Session.get("results"), "/home/oerder/output.yaml");
        return Session.get('results');
    }
});