Meteor.subscribe("groups");
Meteor.subscribe("UserAccounts");
function getuserid(){
    return $(location).attr('pathname').split("/")[2];

}
userid=getuserid();
_obj=  Meteor.users.findOne({"_id": getuserid()});
Template.admin_userdetail.helpers({
    groups: function() {
        var ret = [];
        if (tmp.findOne({type: "roles"}) != undefined){
            var isnotinroles = true;
            groups.find().fetch().forEach(function (ent) {

                isnotinroles = true;
                tmp.findOne({type: "roles"}).value.forEach(function (entry) {
                    if(ent.name==entry) isnotinroles=false;
                });
                if(isnotinroles)  ret.push(ent);
            });
            return ret;
        }
        else return null;
    },
    firstname: function(){
        if(tmp.findOne({type:"firstname"})!=undefined)
            return tmp.findOne({type:"firstname"}).value;
        else return null;
    },
    status: function(){
        if(tmp.findOne({type:"status"})!=undefined)
            return tmp.findOne({type:"status"}).value;
        else return null;
    },
    surname: function(){
        if(tmp.findOne({type:"surname"})!=undefined)
            return tmp.findOne({type:"surname"}).value;
        else return null;
    },
    roles: function(){
        if(tmp.findOne({type:"roles"})!=undefined)
            return tmp.findOne({type:"roles"}).value;
        else return null;
    },
    email: function(){
        if(tmp.findOne({type:"email"})!=undefined)
            return tmp.findOne({type:"email"}).value;
        else return null;
    }
});
Template.admin_userdetail.created = function(){
    if(this.data.id!=undefined) userid=this.data.id;

};
Template.admin_userdetail.rendered = function(){
    Meteor.call("userstatus", userid, function(err,res){
        //$("option[value='"+res+"']").prop('checked', true);
        $("#options").val(res);
    });
    _obj=  Meteor.users.findOne({"_id": userid});
    tmp.remove({});
    tmp.insert({_id: Random.id(), type:"firstname", value:_obj.profile.firstname});
    tmp.insert({_id: Random.id(), type:"status", value:_obj.profile.status});
    tmp.insert({_id: Random.id(), type:"surname", value:_obj.profile.surname});
    tmp.insert({_id: Random.id(), type:"roles", value:_obj.roles});
    tmp.insert({_id: Random.id(), type:"email", value:_obj.emails[0].address});
    tmp.insert({_id: Random.id(), type:"password", value:"_"});
    //tmp.insert({_id: Random.id(), type:"email", value:_obj.emails[0].address});

};

Template.admin_userdetail.events({
    'mouseover #firstname': function(event) {
        input = $('<input type="text" value="'+event.target.innerHTML+'" id="firstnamei" />');
        $(event.target).replaceWith(input);
    },
    'mouseout #firstnamei': function(event) {
        tmp.update({type:"firstname"},{$set: {value: event.target.value}});
        div = $('<div id="firstname">'+event.target.value+'</div>');
        $(event.target).replaceWith(div);

    },
    'mouseover #surname': function(event) {
        input = $('<input type="text" value="'+event.target.innerHTML+'" id="surnamei" />');
        $(event.target).replaceWith(input);
    },
    'mouseout #surnamei': function(event) {
        tmp.update({type:"surname"},{$set: {value: event.target.value}});
        div = $('<div id="surname">'+event.target.value+'</div>');
        $(event.target).replaceWith(div);

    },
    'mouseover #mail': function(event) {
        input = $('<input type="text" value="'+event.target.innerHTML+'" id="maili" />');
        $(event.target).replaceWith(input);
    },
    'mouseout #maili': function(event) {
        tmp.update({type:"email"},{$set: {value: event.target.value}});
        div = $('<div id="mail">'+event.target.value+'</div>');
        $(event.target).replaceWith(div);

    },
    'click #add': function(event){
        tmp.update({type:"roles"},{$push: {value: $("#group")[0].value}});
    },
    'click .del': function(event){
        if($(event.target).is("span"))
            tmp.update({type:"roles"},{$pull: {value: event.target.parentNode.parentNode.childNodes[0].nodeValue}});
        else
            tmp.update({type:"roles"},{$pull: {value: event.target.parentNode.childNodes[0].nodeValue}});
    },
    'change #pw': function(event){
        tmp.update({type:"password"},{$set: {value: $("#pw")[0].value}});

    },
    'change #options': function(event){
        tmp.update({type:"status"},{$set: {value: $("#options")[0].selectedOptions[0].innerHTML}});
    },
    'click #addgroups': function(){
        $('#groupsmodal').modal('show');
    },
    'click #addgrp': function(){
        $('.groupotions').each(function(){
            if($(this)[0].checked){
                tmp.update({type:"roles"},{$push:{value:$(this).val()}});
            }

        });
        $('#groupsmodal').modal('hide');
    },
    'click .gmin': function(event) {
        if(event.target.value!=undefined) tmp.update({type:"roles"},{$pull:{value:event.target.value}});
        else tmp.update({type:"roles"},{$pull:{value:event.target.parentElement.value}});
    },
    'click #save': function(event){
        Meteor.call("alterstatus", userid, tmp.findOne({type:"status"}).value);
        Meteor.call("alterfirstname", userid, tmp.findOne({type:"firstname"}).value);
        Meteor.call("altersurname", userid, tmp.findOne({type:"surname"}).value);
        Meteor.call("alteremail", userid, tmp.findOne({type:"email"}).value);
        if(tmp.findOne({type:"password"}).value.length>1){
            Meteor.call("setpassword", userid, tmp.findOne({type:"password"}).value);
            if(Meteor.userId()===userid) Meteor.logout();
        }
        Meteor.call("altergroups", userid, tmp.findOne({type:"roles"}).value);

        $('#save').addClass('disabled');
        Router.go(encodeURI('/user?message=A user has been changed!'));
    }

});