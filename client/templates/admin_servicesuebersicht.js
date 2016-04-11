Template.admin_servicesuebersicht.helpers({
    'services': function(){
        return services.find();
    }
});


Template.admin_servicesuebersicht.rendered = function(){
    if(querystring("message")[0]!=undefined){
        area = $(".alert-success");
        if(area[0] != undefined) area[0].innerHTML=decodeURI(querystring("message")[0]);
        area.removeClass("hidden");
        area.fadeOut(3000, function(){
            area.addClass("hidden");
        });;
    }
    Meteor.call("readservices");

};
Template.admin_servicesuebersicht.events({
    'click .delete': function(event){
        if(confirm("Do you really want to delete this service?")){
            Meteor.call("delservice", event.target.value);
        }
    },
    'click #refresh': function(event){
        Meteor.call("readservices");
    }
});