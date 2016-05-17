/**
 * Created by oerder on 11.01.16.
 */
Meteor.subscribe("subscriptions");
Meteor.subscribe("UserAccounts");
Meteor.subscribe("policies");



Template.admin_subscriptionsuebersicht.helpers({
    subscription: function(){
        sub = subscriptions.find().fetch();
        rem= [];
        sub.forEach(function(entry){
            if(policies.findOne({_id:entry.policy})!=undefined) rem.push({
               _id: entry._id,
               policy: entry.policy,
               user: entry.user,
               username: Meteor.users.findOne({_id:entry.user}).emails[0].address,
               policyname:  policies.findOne({_id:entry.policy}).name,
               expires: entry.expires
           });
        });
        return rem;
    }
});
Template.admin_subscriptionsuebersicht.events({
    'click .del': function(event){
        if(event.target.id!="")
            Meteor.call("delsubscription", event.target.id);
        else
            Meteor.call("delsubscription", event.target.parentElement.id);
    }
});




Template.admin_subscriptionsuebersicht.rendered = function(){
    if(querystring("message")[0]!=undefined){
        area = $(".alert-success");
        area[0].innerHTML=decodeURI(querystring("message")[0]);
        area.removeClass("hidden");
        area.fadeOut(3000, function(){
            area.addClass("hidden");
        });;
    }

};