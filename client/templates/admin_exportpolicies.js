Meteor.subscribe("policies");

Template.admin_exportpolicies.helpers({
    policies: function(){
        Meteor.call("getyamldata", createYAMLobject(), function(err, res){
            if(err==undefined) Session.set("results", res);
        });
        return Session.get('results');
    }
});