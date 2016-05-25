Meteor.subscribe("subscriptions");
Meteor.subscribe("policies");
Meteor.subscribe("UserAccounts");
Template.user_subscriptionsuebersicht.helpers({
    subscription: function(){
        sub = subscriptions.find().fetch();
        policies.find({unauthenticated:true}).fetch().forEach(function(ent){
                sub.push({
                    "_id" : Random.id(),
                    "policy" : ent._id,
                    "user" : Meteor.userId(),
                    "key" : "none",
                    "expires" : "never"
                });
        }

            );

        rem= [];
        sub.forEach(function(entry){
            if(entry.expires==undefined)entry.expires="never";
            if(entry.expires!="never") entry.expires= new Date(entry.expires).toString();
            if(policies.findOne({_id:entry.policy})!=undefined) rem.push({
                _id: entry._id,
                policy: entry.policy,
                user: entry.user,
                username: Meteor.users.findOne({_id:entry.user}).emails[0].address,
                policyname: policies.findOne({_id:entry.policy}).name,
                services: policies.findOne({_id:entry.policy}).services,
                expires: entry.expires
            });
        });
        return rem;
    }
});