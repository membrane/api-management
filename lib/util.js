createYAMLobject= function(){
    var pol = policies.find().fetch();
    var ret = {policies: [], keys: []};
    pol.forEach(function (entry) {
        var rez = [];
        entry.services.forEach(function (ent) {
            if (ent != undefined)rez.push(ent.name.toString());
        });
        if (entry != undefined){
            if(entry.unauthenticated==undefined) entry.unauthenticated=false;
            ret.policies.push({
                policy: {
                    id: entry.name,
                    unauthenticated: entry.unauthenticated,
                    rateLimit: entry.rateLimit,
                    quota: entry.quota,
                    serviceProxy: rez
                }
            })
        }
    });
    var sub = subscriptions.find().fetch();
    sub.forEach(function (entry) {
        var rez = [];
        if (policies.findOne({_id: entry.policy}) != undefined) rez.push(policies.findOne({_id: entry.policy}).name);
        ret.keys.push({key: entry.key, policies: rez})
    });
    return ret;
};

 compose= function () {
    var arg = arguments;
    return function(x){
        for(var i=arg.length-1; i>=0; i--) {
            x= arg[i](x);

        }
        return x;
    }
};


secondsToString = function (seconds)
{

    if(seconds!=undefined){
        seconds= parseInt(seconds, 10);
        var numdays = Math.floor(seconds / 86400);
        var numhours = Math.floor((seconds % 86400) / 3600);
        var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
        var numseconds = ((seconds % 86400) % 3600) % 60;
        if(Number.isNaN(numdays) || Number.isNaN(numhours) || Number.isNaN(numminutes) || Number.isNaN(numseconds)) return ;
        ret= "";
        if(numdays>0) ret+=numdays+" d ";

        if(numhours>0) ret+=numhours+" h ";

        if(numminutes>0) ret+=numminutes+" m ";

        if(numseconds>0) ret+=numseconds+" s ";
        return ret;
    }

};


setCookie =function (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

getCookie = function (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
};

querystring =function (key) {
    var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi');
    var r=[], m;
    while ((m=re.exec(document.location.search)) != null) r[r.length]=m[1];
    return r;
};