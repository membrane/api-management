Meteor.subscribe("policies");
Meteor.subscribe("subscriptions");


Template.user_policiesuebersicht.helpers({
    policies: function(){
        pol= policies.find().fetch();
        polic = [];
        pol.forEach(function(ent){

            if(subscriptions.findOne({policy: ent._id, user: Meteor.userId()})!=undefined || ent.unauthenticated){
                ent.subscribed = true;
            }
            else ent.subscribed = false;

            if(secondsToString(ent.rateLimit.interval)===undefined)
                ent.rateLimit.bool = false;
            else
                ent.rateLimit.bool = true;

            if(secondsToString(ent.quota.interval)===undefined)
                ent.quota.bool = false;
            else
                ent.quota.bool = true;

            ent.rateLimit.interval_=secondsToString(ent.rateLimit.interval);
            ent.quota.interval_=secondsToString(ent.quota.interval);
            polic.push(ent);
        });
        return polic;
    }
});