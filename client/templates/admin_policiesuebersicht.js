Meteor.subscribe('policies');



Template.admin_policiesuebersicht.helpers({
   policy : function(){
       polc = [];
       pol = policies.find().fetch();
       pol.forEach(function(ent){
           if(secondsToString(ent.quota.interval)!=undefined) ent.quota.interval_ = " in "+secondsToString(ent.quota.interval);
           if(secondsToString(ent.rateLimit.interval)!=undefined) ent.rateLimit.interval_ = " requests in "+secondsToString(ent.rateLimit.interval);
           polc.push(ent);
       });
        return polc;
   }
});

Template.admin_policiesuebersicht.events({
    'click .delete': function(event){
        if(confirm("Do you really want to delete this policy?")){
            Meteor.call("delpolicy", event.target.value);
        }
    }
});

function querystring(key) {
    var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi');
    var r=[], m;
    while ((m=re.exec(document.location.search)) != null) r[r.length]=m[1];
    return r;
}

Template.admin_policiesuebersicht.rendered = function(){
    if(querystring("message")[0]!=undefined){
        area = $(".alert-success");
        area[0].innerHTML=decodeURI(querystring("message")[0]);
        area.removeClass("hidden");
        area.fadeOut(3000, function(){
            area.addClass("hidden");
        });;
    }

};