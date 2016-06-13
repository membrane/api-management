Template.admin_dashboard.helpers({
    users: function(){
        return Meteor.users.find({"profile.status":"unapproved"}).fetch();
    }
});