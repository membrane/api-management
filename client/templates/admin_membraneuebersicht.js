function isInArray(value, array) {
    return array.indexOf(value) > -1;
}
Meteor.subscribe("membranes");

Template.admin_membraneuebersicht.rendered= function(){
    Meteor.call("readservices");
};
Template.admin_membraneuebersicht.helpers({
    membranes: function(){
        return membranes.find();

    }
});
Template.admin_membraneuebersicht.events({
    'click #refresh': function(event){
        Meteor.call("readservices");
    }
});
