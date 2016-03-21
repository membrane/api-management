Meteor.subscribe("groups");
Meteor.subscribe("UserAccounts");
function getuserid(){
    return $(location).attr('pathname').split("/")[2];

}
userid=getuserid();
Template.admin_userdetail.helpers({
    user: function(){
        return Meteor.users.findOne({"_id":userid});
    },
    groups: function(){

        ret = [];
        thisuser = Meteor.users.findOne({"_id": userid});
        if(thisuser!=undefined) {
            groups.find().fetch().forEach(function (entry) {
                    rez = true;
                    if(thisuser.roles!=undefined){
                        thisuser.roles.forEach(function(ent){
                            if(ent==entry.name) rez= false; //entry ist schon drin.
                        });
                    }
                    if(rez) ret.push(entry);
            });
        }
        return ret;
    }
});
Template.admin_userdetail.created = function(){
    userid=this.data.id;
};
Template.admin_userdetail.rendered = function(){
    Meteor.call("userstatus", userid, function(err,res){
        //$("option[value='"+res+"']").prop('checked', true);
        $("#options").val(res);
    });

};

Template.admin_userdetail.events({
    'mouseover #firstname': function(event) {
        input = $('<input type="text" value="'+event.target.innerHTML+'" id="firstnamei" />');
        $(event.target).replaceWith(input);
    },
    'mouseout #firstnamei': function(event) {
        Meteor.call("alterfirstname", userid, event.target.value);
        div = $('<div id="firstname">'+event.target.value+'</div>');
        $(event.target).replaceWith(div);

    },
    'mouseover #surname': function(event) {
        input = $('<input type="text" value="'+event.target.innerHTML+'" id="surnamei" />');
        $(event.target).replaceWith(input);
    },
    'mouseout #surnamei': function(event) {
        Meteor.call("altersurname", userid, event.target.value);
        div = $('<div id="surname">'+event.target.value+'</div>');
        $(event.target).replaceWith(div);

    },
    'mouseover #mail': function(event) {
        input = $('<input type="text" value="'+event.target.innerHTML+'" id="maili" />');
        $(event.target).replaceWith(input);
    },
    'mouseout #maili': function(event) {
        Meteor.call("alteremail", userid, event.target.value);
        div = $('<div id="mail">'+event.target.value+'</div>');
        $(event.target).replaceWith(div);

    },
    'click #add': function(event){
        Meteor.call("addgroup", userid, $("#group")[0].value);
    },
    'click .del': function(event){
        if($(event.target).is("span"))Meteor.call("delgroup", userid, event.target.parentNode.parentNode.childNodes[0].nodeValue);
        else Meteor.call("delgroup", userid, event.target.parentNode.childNodes[0].nodeValue);
    },
    'click #password': function(event){

        Meteor.call("setpassword", userid, $("#pw")[0].value);

        $(".alert-success").fadeIn(1, function(){
            $(".alert-success").removeClass("hidden");
        });
        $(".alert-success").fadeOut(3000, function(){
            $(".alert-success").addClass("hidden");
        });
    },
    'change #options': function(event){
        Meteor.call("setstatus", userid, $("#options")[0].selectedOptions[0].innerHTML);
    }

});