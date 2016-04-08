createYAMLobject= function(){
    var pol = policies.find().fetch();
    var ret = {policies: [], keys: []};
    pol.forEach(function (entry) {
        var rez = [];
        entry.services.forEach(function (ent) {
            if (ent != undefined)rez.push(ent.name.toString());
        });
        if (entry != undefined)ret.policies.push({
            policy: {
                id: entry.name,
                rateLimit: entry.rateLimit,
                quota: entry.quota,
                serviceProxy: rez
            }
        })
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