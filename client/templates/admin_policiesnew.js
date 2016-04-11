Meteor.subscribe("policies");
Meteor.subscribe("services");

Template.admin_policiesnew.created= function(){
    tmp.remove({});
    services.find().fetch().forEach(function(entry){
       tmp.insert({type: "aservice", name: entry.name, _id: entry._id, membrane: entry.membrane, url: entry.url});
    });
    groups.find().fetch().forEach(function(entry){
        tmp.insert({_id: entry._id, type: "agroup", name: entry.name});
    });
};
Template.admin_policiesnew.rendered = function(){

};
Template.admin_policiesnew.helpers({
    service: function(){
        return tmp.find({type:"service"});
    },
    aviableservice: function(){
        return tmp.find({type:"aservice"}).fetch();
    },
    groups: function(){
        return tmp.find({type:"group"});
    },
    aviablegroups: function(){
        return tmp.find({type:"agroup"}).fetch();
    }
});

Template.admin_policiesnew.events({
    'click #gadd': function(event) {
        tmp.update({name:event.target.parentNode.parentNode.childNodes[0].childNodes[0].nodeValue},{$set:{type:"group"}});
    },
    'click #gmin': function(event) {
        if(event.target.value!=undefined) tmp.update({_id:event.target.value},{$set:{type:"agroup"}});
        else tmp.update({_id:event.target.parentElement.value},{$set:{type:"agroup"}});
    },
    'click #min': function(event) {
        if(event.target.value!=undefined) tmp.update({_id:event.target.value},{$set:{type:"aservice"}});
        else tmp.update({_id:event.target.parentElement.value},{$set:{type:"aservice"}});
    },
    'click #save': function() {
       rem = [];
       tmp.find({type: "service"}).fetch().forEach(function(entry){
           rem.push({_id:entry._id, name:entry.name});
       });
       ret2 = [];
       tmp.find({type: "group"}).fetch().forEach(function(entry){
           ret2.push({_id:entry._id, name:entry.name});
       });
       policies.insert({
          "name": $("#name")[0].value,
           "description": $("#description")[0].value,
          "services": rem,
           "groups" : ret2,
           "rateLimit": {
               "requests": $("#rateLimitRequests")[0].value,
               "interval": $("#rateLimitInterval")[0].value
           },
           "quota": {
               "size": $("#QuotaSize")[0].value,
               "interval": $("#QuotaInterval")[0].value
           }
       });
       $('#save').addClass('disabled');
       Router.go(encodeURI('/policy?message=A new policy has been added!'));
    },
    'click #reset': function() {
       tmp.remove({});
       services.find().fetch().forEach(function(entry){
           tmp.insert({type: "aservice", name: entry.name, _id: entry._id, membrane: entry.membrane, url: entry.url});
       });
       groups.find().fetch().forEach(function(entry){
           tmp.insert({_id: entry._id, type: "agroup", name: entry.name});
       });
        $("#name")[0].value="";
        $('#save').removeClass('disabled');
       $(".alert-success").addClass("hidden");
    },
    'click #addservices': function(){
        $('#servicesmodal').modal('show');
    },
    'click #addserv': function(){
        $('.serviceoptions').each(function(){
            if($(this)[0].checked){
                tmp.update({_id:$(this).val()},{$set:{type:"service"}});
            }

        })
        $('#servicesmodal').modal('hide');
    },
    'click #addgroups': function(){
        $('#groupsmodal').modal('show');
    },
    'click #addgrp': function(){
        $('.groupotions').each(function(){
            if($(this)[0].checked){
                tmp.update({_id:$(this).val()},{$set:{type:"group"}});
            }

        })
        $('#groupsmodal').modal('hide');
    }
});
