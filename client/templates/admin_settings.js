Meteor.subscribe("settings");
Template.admin_settings.helpers({
    etcdurl : function(){
        return settings.findOne({type:"etcdurl"});
    },
    membraneusername : function(){
        return settings.findOne({type:"membraneusername"});
    },
    membranepassword : function(){
        return settings.findOne({type:"membranepassword"});
    },
    exportpassword : function(){
        return settings.findOne({type:"exportpassword"});
    },
    exportusername: function(){
        return settings.findOne({type:"exportusername"});
    },
    key : function(){
        return settings.findOne({type:"key"});
    },
    cert : function(){
        return settings.findOne({type:"cert"});
    },
    ca : function(){
        return settings.findOne({type:"ca"});
    }
});
Template.admin_settings.events({
    "click .change": function(event){
        //console.log(event.target);
        Meteor.call("chsettings", "etcdurl",$("#etcdurl")[0].value );
        Meteor.call("chsettings", "membraneusername",$("#membraneusername")[0].value );
        Meteor.call("chsettings", "membranepassword",$("#membranepassword")[0].value );
        Meteor.call("chsettings", "exportusername",$("#exportusername")[0].value );
        Meteor.call("chsettings", "exportpassword",$("#exportpassword")[0].value );

        Meteor.call("chsettings", "key",$("#key")[0].value );
        Meteor.call("chsettings", "cert",$("#cert")[0].value );
        Meteor.call("chsettings", "ca",$("#ca")[0].value );
        //settings.update({_id: event.target.id}, {$set: {value:$("#etcdurl")[0].value}});
        $("#succesmodal").modal("show");
        setTimeout(function(){
            $("#succesmodal").modal("hide");
        }, 1300);
    },
    'click #ok': function(){
        $('#succesmodal').modal('hide');
    },
    "click .shpw": function(event){
        //console.log(event.target);
        if($(".pw")[0].type=="password") {
            $(".pw").attr("type", "text");
            $(".shpw")[0].value="hide passwords";
        }
        else {
            $(".pw").attr("type", "password");
            $(".shpw")[0].value="show passwords";
        }

    }
});