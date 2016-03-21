Meteor.subscribe("subscriptions");
Meteor.subscribe("policies");
Meteor.subscribe("UserAccounts");
function getsubscriptionid(){
    return $(location).attr('pathname').split("/")[2];

}
subscriptionid=getsubscriptionid();
_obj = subscriptions.find({_id: subscriptionid}).fetch()[0];

Template.admin_subscriptiondetail.created= function(){
    subscriptionid = this.data.id;
};

Template.admin_subscriptiondetail.helpers({
    _id: function(){
        return subscriptionid;
    },
    key: function(){
        //console.log(subscriptionid, subscriptions.find({_id: subscriptionid}).fetch());
        return subscriptions.find({_id: subscriptionid}).fetch()[0].key;
    },
    user: function(){
        return Meteor.users.find({"_id":subscriptions.find({_id: subscriptionid}).fetch()[0].user}).fetch()[0];
    },
    policy: function(){
        return policies.find({"_id":subscriptions.find({_id: subscriptionid}).fetch()[0].policy}).fetch()[0];
    }
});