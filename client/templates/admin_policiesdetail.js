Meteor.subscribe("policies");
Meteor.subscribe("services");
function getpolicyid(){
    return $(location).attr('pathname').split("/")[2];

}

function isnotsize(size){
    return !(size.length===0 ||  ['B', 'K', 'M', 'G', 'T'].indexOf(size.substring(size.length-1, size.length))!=-1 &&  /^\d+$/.test(size.substring(0, size.length -1)));
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
    if(policies.findOne({_id:policyid}).unauthenticated!=undefined)tmp.insert({type:"unauthenticated", value: policies.findOne({_id:policyid}).unauthenticated});
    else tmp.insert({type:"unauthenticated", value: false});
    if(policies.findOne({_id:policyid}).expires!=undefined && policies.findOne({_id:policyid}).unauthenticated!=true){
        if(policies.findOne({_id:policyid}).expires=="never"){
            $("#afterexp")[0].checked=false;
            $("#neverexp")[0].checked=true;
        } else {
            $("#afterexp")[0].checked=true;
            $("#neverexp")[0].checked=false;
            $("#expiresT")[0].value=policies.findOne({_id:policyid}).expires.substr(0, policies.findOne({_id:policyid}).expires.length-1);
            //console.log(policies.findOne({_id:policyid}).expires.substr(policies.findOne({_id:policyid}).expires.length-1, policies.findOne({_id:policyid}).expires.length));
            $('#expiresS option').removeAttr('selected');
            //console.log($("#expiresS option[value='"+policies.findOne({_id:policyid}).expires.substr(policies.findOne({_id:policyid}).expires.length-1, policies.findOne({_id:policyid}).expires.length)+"']"));
            $("#expiresS option[value='"+policies.findOne({_id:policyid}).expires.substr(policies.findOne({_id:policyid}).expires.length-1, policies.findOne({_id:policyid}).expires.length)+"']").attr('selected',true);
        }
    }
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
    },
    unauthenticated: function(){
        if(tmp.findOne({type:"unauthenticated"})!=undefined)
            return tmp.findOne({type:"unauthenticated"}).value;
        else return false;
    },
    markdownhint: function(){
        if(getCookie("markdownhint"))
            return false;
        else return true;
    }

});

Template.admin_policiesdetail.events({
    'click .close': function(){
        setCookie("markdownhint", true, 20000);
    },
    'click .gmin': function(event) {
        if(event.target.value!=undefined) tmp.update({_id:event.target.value},{$set:{type:"agroup"}});
        else tmp.update({_id:event.target.parentElement.value},{$set:{type:"agroup"}});
    },
    'click .min': function(event) {
        if(event.target.value!=undefined) tmp.update({_id:event.target.value},{$set:{type:"aservice"}});
        else tmp.update({_id:event.target.parentElement.value},{$set:{type:"aservice"}});
    },
    'click .unauthenticated': function(event) {
        tmp.update({type: "unauthenticated"}, {$set: {value: $(".unauthenticated:checked").val()=="true"}});
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
        if(($("#rateLimitRequests")[0].value<=0 && $("#rateLimitRequests")[0].value!= "")|| ($("#rateLimitInterval")[0].value<=0 && $("#rateLimitInterval")[0].value!= "") || ($("#QuotaInterval")[0].value<=0 && $("#QuotaInterval")[0].value!= "") || isnotsize($("#QuotaSize")[0].value))
            alert("There was a problem: Some inputs were not in the correct format.")
        else{
            if($(".expires:checked")[0]!=undefined){
                if($(".expires:checked").val()=="never") exp="never";
                else exp=$("#expiresT")[0].value+$("#expiresS").val();
            }
            else exp="never";
            policies.update({_id:policyid},
                {
                    $set: {
                        "name": $("#name")[0].value,
                        "unauthenticated": tmp.findOne({type:"unauthenticated"}).value,
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
                    }
                });

            Router.go(encodeURI('/policy?message=All changes were saved!'));
        }

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
