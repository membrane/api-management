Meteor.subscribe("policies");
Meteor.subscribe("subscriptions");
Meteor.subscribe("UserAccounts");



Template.admin_subscriptionnew.rendered=function(){
    if(getCookie("infoalertsubscription")=="true") $('#alertinfo').hide(0);
    $('#alertinfo').on('closed.bs.alert', function () {
        setCookie("infoalertsubscription", "true", 365);
        console.log(getCookie("infoalertsubscription"));
    });
};

Template.admin_subscriptionnew.helpers({
    policy: function(){
        if(policies.findOne({name:"unauthorized"})!=undefined){
            return policies.find({_id:{
                $ne: policies.findOne({name:"unauthorized"})._id
            }});
        }
        else return policies.find();
    },
    user: function(){
        return Meteor.users.find();
    },
    randomkey: function(){
        return Math.random().toString(36).slice(-8)+Math.random().toString(36).slice(-8)+Math.random().toString(36).slice(-8);
    }
});

Template.admin_subscriptionnew.events({
    'click #save': function() {

        subscriptions.insert({
            "_id": Random.id(),
            "policy": $("#policies").val(),
            "user": $("#user").val(),
            "key": $("#key")[0].value
        });

        $('#save').addClass('disabled');
        Router.go(encodeURI('/subscription?message=A new subscription has been added!'));
    },
    'click #reset': function(){
        $("#key")[0].value=Math.random().toString(36).slice(-8)+Math.random().toString(36).slice(-8)+Math.random().toString(36).slice(-8);
        $('#save').removeClass('disabled');
    }

})
