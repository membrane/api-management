Meteor.subscribe("policies");
Meteor.subscribe("subscriptions");

function secondsToString(seconds)
{

    if(seconds!=undefined){
        seconds= parseInt(seconds, 10);
        var numdays = Math.floor(seconds / 86400);
        var numhours = Math.floor((seconds % 86400) / 3600);
        var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
        var numseconds = ((seconds % 86400) % 3600) % 60;
        if(Number.isNaN(numdays) || Number.isNaN(numhours) || Number.isNaN(numminutes) || Number.isNaN(numseconds)) return ;
        ret= "";
        if(numdays>0) ret+=numdays+" d ";

        if(numhours>0) ret+=numhours+" h ";

        if(numminutes>0) ret+=numminutes+" m ";

        if(numseconds>0) ret+=numseconds+" s ";

        return ret;
    }

}
Template.user_policiesuebersicht.helpers({
    policies: function(){
        pol= policies.find().fetch();
        polic = [];
        pol.forEach(function(ent){

            if(subscriptions.findOne({policy: ent._id, user: Meteor.userId()})!=undefined){
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