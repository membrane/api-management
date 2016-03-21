Meteor.subscribe("subscriptions");
Meteor.subscribe("policies");
Meteor.subscribe("UserAccounts");
Template.user_subscriptionsuebersicht.helpers({
    subscription: function(){
        sub = subscriptions.find().fetch();
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