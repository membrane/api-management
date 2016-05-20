Meteor.subscribe("policies");
Meteor.subscribe("services");
function isnotsize(size){
    return  !(size.length===0 ||['B', 'K', 'M', 'G', 'T'].indexOf(size.substring(size.length-1, size.length))!=-1 &&  /^\d+$/.test(size.substring(0, size.length -1)));
}
Template.admin_policiesnew.created= function(){
    tmp.remove({});
    services.find().fetch().forEach(function(entry){
       tmp.insert({type: "aservice", name: entry.name, _id: entry._id, membrane: entry.membrane, url: entry.url});
    });
    groups.find().fetch().forEach(function(entry){
        tmp.insert({_id: entry._id, type: "agroup", name: entry.name});
    });
    tmp.insert({type:"unauthenticated", value: false});
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
    },
    unauthenticated: function(){
        return tmp.findOne({type:"unauthenticated"}).value;
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
    'click .unauthenticated': function(event) {
        tmp.update({type: "unauthenticated"}, {$set: {value: $(".unauthenticated:checked").val()=="true"}})
        if(tmp.findOne({type:"unauthenticated"}).value)tmp.find({type:"group"}).fetch().forEach(function(ent){
            tmp.update({_id:ent._id},{$set:{type:"agroup"}});
        });
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
        console.log(($("#rateLimitRequests")[0].value));
        if(($("#rateLimitRequests")[0].value<=0 && $("#rateLimitRequests")[0].value!= "")|| ($("#rateLimitInterval")[0].value<=0 && $("#rateLimitInterval")[0].value!= "") || ($("#QuotaInterval")[0].value<=0 && $("#QuotaInterval")[0].value!= "") || isnotsize($("#QuotaSize")[0].value))
            alert("There was a problem: Some inputs were not in the correct format.")
        else {
            if($(".expires:checked")[0]!=undefined){
                if($(".expires:checked").val()=="never") exp="never";
                else exp=$("#expiresT")[0].value+$("#expiresS").val();
            }
            else exp="never";
            policies.insert({
                "name": $("#name")[0].value,
                "unauthenticated": tmp.findOne({type: "unauthenticated"}).value,
                "description": $("#description")[0].value,
                "services": rem,
                "groups": ret2,
                "rateLimit": {
                    "requests": $("#rateLimitRequests")[0].value,
                    "interval": $("#rateLimitInterval")[0].value
                },
                "quota": {
                    "size": $("#QuotaSize")[0].value,
                    "interval": $("#QuotaInterval")[0].value
                },
                "expires": exp
            });
            $('#save').addClass('disabled');
            Router.go(encodeURI('/policy?message=A new policy has been added!'));
        }
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
        tmp.insert({type:"unauthenticated", value: false});
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

        });
        $('#groupsmodal').modal('hide');
    }
});
