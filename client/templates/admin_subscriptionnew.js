Meteor.subscribe("policies");
Meteor.subscribe("subscriptions");
Meteor.subscribe("UserAccounts");

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

Template.admin_subscriptionnew.rendered=function(){
    if(getCookie("infoalertsubscription")=="true") $('#alertinfo').hide(0);
    $('#alertinfo').on('closed.bs.alert', function () {
        setCookie("infoalertsubscription", "true", 365);
        console.log(getCookie("infoalertsubscription"));
    });
};

Template.admin_subscriptionnew.helpers({
    policy: function(){
        return policies.find();
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
