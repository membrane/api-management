Meteor.subscribe("policies");
Meteor.subscribe("services");
function getpolicyid(){
    return $(location).attr('pathname').split("/")[2];

}
policyid=getpolicyid();

Template.admin_policiesdetail.created= function(){
    policyid = this.data.id;
};

Template.admin_policiesdetail.rendered=function(){
    tmp.remove({});
    services.find().fetch().forEach(function(entry){
        rer=false;
        policies.findOne({_id:policyid}).services.forEach(function(ent){
            if(entry.name == ent.name) rer=true;
        });
        if(rer)tmp.insert({type: "service", name: entry.name, _id:entry._id, membrane: entry.membrane, url: entry.url});
        else tmp.insert({type: "aservice", name: entry.name, _id:entry._id, membrane: entry.membrane, url: entry.url});
    });
    groups.find().fetch().forEach(function(entry){
        rer=false;
        if(policies.findOne({_id:policyid}).groups!=undefined) policies.findOne({_id:policyid}).groups.forEach(function(ent){
            if(entry.name == ent.name) rer=true;
        });
        if(rer)tmp.insert({_id: entry._id, type: "group", name: entry.name});
        else tmp.insert({_id: entry._id, type: "agroup", name: entry.name});
    });
};


Template.admin_policiesdetail.helpers({
    service: function(){
        return tmp.find({type:"service"}).fetch();
    },
    aviableservice: function(){
        return tmp.find({type:"aservice"}).fetch();
    },
    groups: function(){
        return tmp.find({type:"group"}).fetch();
    },
    aviablegroups: function(){
        return tmp.find({type:"agroup"}).fetch();
    },
    description: function(){
        return policies.findOne({_id:policyid}).description;
    },
    name: function(){
        return policies.findOne({_id:policyid}).name;
    },
    rateLimitRequests: function(){
        if(policies.findOne({_id:policyid}).rateLimit!=undefined)
            return policies.findOne({_id:policyid}).rateLimit.requests;
        else return null;
    },
    rateLimitInterval: function(){
        if(policies.findOne({_id:policyid}).rateLimit!=undefined)
            return policies.findOne({_id:policyid}).rateLimit.interval;
        else return null;
    },
    QuotaSize: function(){
        if(policies.findOne({_id:policyid}).quota!=undefined)
            return policies.findOne({_id:policyid}).quota.size;
        else return null;
    },
    QuotaInterval: function(){
        if(policies.findOne({_id:policyid}).quota!=undefined)
            return policies.findOne({_id:policyid}).quota.interval;
        else return null;
    }

});

Template.admin_policiesdetail.events({
    'click #gmin': function(event) {
        tmp.update({name:event.target.parentNode.parentNode.childNodes[0].childNodes[0].nodeValue},{$set:{type:"agroup"}});
    },
    'click #min': function(event) {
        tmp.update({name:event.target.parentNode.parentNode.childNodes[0].childNodes[0].nodeValue},{$set:{type:"aservice"}});
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
        policies.update({_id:policyid},
            {
                $set: {
                    "name": $("#name")[0].value,
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
                    }
                }
            });
        $("#succesmodal").modal("show");
        setTimeout(function(){
            $("#succesmodal").modal("hide");
        }, 1300);


    },'click #ok': function(){
        $('#succesmodal').modal('hide');
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
