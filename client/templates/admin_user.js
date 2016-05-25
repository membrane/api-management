Template.admin_user.helpers({
    user: function(){
        var us=Meteor.users.find({}).fetch();
        us.forEach(function(ent){
            if(ent.profile.status=="unapproved") ent.unapproved=true;
        });

        return us;
    },
    unapproved: function(){
        var un=false;
        var us=Meteor.users.find({}).fetch();
        us.forEach(function(ent){
            if(ent.profile.status=="unapproved") {
                un=true;
            }
        });
        return un;
    }
});

function isemail(str){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(str);
}
Template.admin_user.rendered= function(){
    if(querystring("message")[0]!=undefined){
        area = $(".alert-success");
        area[0].innerHTML=decodeURI(querystring("message")[0]);
        area.removeClass("hidden");
        area.fadeOut(3000, function(){
            area.addClass("hidden");
        });;
    }

};
Template.admin_user.events({
    'click .delete': function(event){
        if(event.target.value!=undefined) Ziel = event.target.value; //Auf den Button geklickt.
        else Ziel=event.target.parentNode.value; //Auf den Mülleimer geklickt
        if(confirm("Do you really want to delete this user?")) {
            Meteor.call('deleteuser',Ziel);
        }
    },
    'click #createnewuser': function(event) {
        if(!isemail($("[name=email]")[0].value)){
            alert("There is a problem: The emailaddress seems to be not valid.")
        }
        else{
            firstname = $("[name=firstname]")[0].value;
            surname = $("[name=surname]")[0].value;
            email = $("[name=email]")[0].value;
            password = $("[name=password]")[0].value;
            Meteor.call("createnewuser", firstname, surname, email, password);
        }
    },
    'click #add': function(event) {
       newrole = event.target.parentNode.parentNode.children[0].children[0].value;
       userid = null;
       bb=  $.grep(event.target.parentNode.children, function(){
            return this.type == "input";
        });
        //Meteor.call("addrole", )
    }

});