Meteor.subscribe("subscriptions");
Meteor.subscribe("policies");
Meteor.subscribe("UserAccounts");
Template.user_subscriptionsuebersicht.helpers({
    subscription: function(){
        sub = subscriptions.find().fetch();
        if(policies.findOne({name:"unauthorized"})!=undefined)
                sub.push({
                    "_id" : Random.id(),
                    "policy" : policies.findOne({name:"unauthorized"})._id,
                    "user" : Meteor.userId(),
                    "key" : "none"
                }
            );
        rem= [];
        sub.forEach(function(entry){
            if(policies.findOne({_id:entry.policy})!=undefined) rem.push({
                _id: entry._id,
                policy: entry.policy,
                user: entry.user,
                username: Meteor.users.findOne({_id:entry.user}).emails[0].address,
                policyname: policies.findOne({_id:entry.policy}).name,
                services: policies.findOne({_id:entry.policy}).services
            });
        });
        return rem;
    }
});