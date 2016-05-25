Meteor.subscribe("policies");
Meteor.subscribe("subscriptions");
Meteor.subscribe("services");
function getpolicyid(){
    return $(location).attr('pathname').split("/")[3];

}
policyid=getpolicyid();

Template.user_policiesdetail.created= function(){
    if(this.data!=null) policyid = this.data.id;
};

Template.user_policiesdetail.helpers({
    policy: function(){
        var ret= policies.findOne({_id:policyid});
        if(ret!=undefined){
            var serv=[];
            ret.services.forEach(function(entry){
                if(services.findOne({_id:entry._id})!=undefined) serv.push(services.findOne({_id:entry._id}));
            });

            ret.services=serv;
        }
        return ret;
    },
    apikey: function(){
        if(subscriptions.findOne({policy: policyid, user: Meteor.userId()})!=undefined){
            return subscriptions.findOne({policy: policyid, user: Meteor.userId()}).key;
        }
        else return null;
    },
    apikeybool: function(){
        return subscriptions.findOne({policy: policyid, user: Meteor.userId()})!=undefined;
    },
    unauthorized: function(){
        return  policies.find({_id:policyid}).fetch()[0].unauthenticated==true;
    }
});

Template.user_policiesdetail.events({
    "click #subscribe": function(event){
        _obj = policies.find({_id:policyid}).fetch()[0];
        if(_obj!= undefined){
            if(subscriptions.find({policy: _obj._id,
                    user: Meteor.userId()}).fetch().length === 0){
                if(!_obj.unauthenticated)Meteor.call("insertsubscription", Meteor.userId(), _obj._id, Math.random().toString(36).slice(-8)+Math.random().toString(36).slice(-8)+ Math.random().toString(36).slice(-8));
            }
        }
    },
    "click #unsubscribe": function(event){
        if(confirm("Do you really want to unsubscribe this policy?")){
            Meteor.call("delsubscription", subscriptions.findOne({policy: policyid, user: Meteor.userId()})._id);
        }
    }
});
