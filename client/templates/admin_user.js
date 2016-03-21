Template.admin_user.helpers({
    user: function(){
        return Meteor.users.find({});
    }
});

Template.admin_user.events({
    'click .delete': function(event){
        if(event.target.value!=undefined) Ziel = event.target.value; //Auf den Button geklickt.
        else Ziel=event.target.parentNode.value; //Auf den Mülleimer geklickt
        if(confirm("Do you really want to delete this user?")) {
            Meteor.call('deleteuser',Ziel);
        }
    },
    'click #createnewuser': function(event) {
        firstname = $("[name=firstname]")[0].value;
        surname = $("[name=surname]")[0].value;
        email = $("[name=email]")[0].value;
        password = $("[name=password]")[0].value;
        Meteor.call("createnewuser", firstname, surname, email, password);
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