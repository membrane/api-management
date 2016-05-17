Meteor.subscribe("groups");

Template.admin_gruppenuebersicht.helpers({
    groups: function(){
        return groups.find().fetch();
        /*rem = [];
        user= Meteor.users.find({}).fetch();
        user.forEach(function(entry) {
            roles= entry.roles;
            roles.forEach( function(ent){
                rem.push(ent);
            });
        });
        uniqueGroups = [];
        $.each(rem, function(i, el){
            if($.inArray(el, uniqueGroups) === -1) uniqueGroups.push(el);
        });
        return uniqueGroups;*/
    }
});
Template.admin_gruppenuebersicht.events({
    "click .del": function(event){
        if(confirm("Do you really want to delete this group?")){
            if(event.target.id=="") Meteor.call("dellgroup", event.target.parentElement.id);
            else Meteor.call("dellgroup", event.target.id);
        }


    },
    "click #add": function(event){
        Meteor.call("addlgroup", event.target.parentElement.firstElementChild.value)
    }
});