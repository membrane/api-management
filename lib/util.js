getdate = function (exp){
    if(exp==="never") return "never";
    else {
        var d = new Date();
        var t = parseInt(exp.substring(0,exp.length-1));
        if(exp.substring(exp.length-1, exp.length)=="H"){
            d= new Date(d.setTime(d.getTime() + (t* 60 * 60 * 1000)));
        } else if(exp.substring(exp.length-1, exp.length)=="D"){
            d= new Date(d.setTime(d.getTime() + (t* 24 * 60 * 60 * 1000)));
        } else if(exp.substring(exp.length-1, exp.length)=="M"){
            d= new Date(d.setTime(d.getTime() + (t* 30 * 24 * 60 * 60 * 1000)));
        } else if(exp.substring(exp.length-1, exp.length)=="Y") {
            d= new Date(d.setTime(d.getTime() + (t*12* 30 * 24 * 60 * 60 * 1000)));
        }
        return d.toISOString();
    }

};
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
            if((entry.rateLimit.interval=="" || entry.rateLimit.requests=="") && (entry.quota.interval=="" || entry.quota.size==""))
                ret.policies.push({
                    policy: {
                        id: entry.name,
                        unauthenticated: entry.unauthenticated,
                        serviceProxy: rez,
                    }
                });
            else if(entry.quota.interval=="" || entry.quota.size=="")ret.policies.push({
                policy: {
                    id: entry.name,
                    unauthenticated: entry.unauthenticated,
                    rateLimit: {interval: parseInt(entry.rateLimit.interval), requests: parseInt(entry.rateLimit.requests)},
                    serviceProxy: rez,
                }
            });
            else if(entry.rateLimit.interval=="" || entry.rateLimit.requests=="")ret.policies.push({
                policy: {
                    id: entry.name,
                    unauthenticated: entry.unauthenticated,
                    quota: {interval: parseInt(entry.quota.interval), size: parseInt(entry.quota.size)},
                    serviceProxy: rez,
                }
            });
            else ret.policies.push({
                    policy: {
                        id: entry.name,
                        unauthenticated: entry.unauthenticated,
                        rateLimit: {interval: parseInt(entry.rateLimit.interval), requests: parseInt(entry.rateLimit.requests)},
                        quota: {interval: parseInt(entry.quota.interval), size: parseInt(entry.quota.size)},
                        serviceProxy: rez,
                    }
                });

        }
    });
    var sub = subscriptions.find().fetch();
    sub.forEach(function (entry) {
        var rez = [];
        if (policies.findOne({_id: entry.policy}) != undefined){
            rez.push(policies.findOne({_id: entry.policy}).name);
        }
        if(entry.expires!="" && entry.expires!=undefined && entry.expires!="never") ret.keys.push({key: entry.key, policies: rez, expires: entry.expires});
        else ret.keys.push({key: entry.key, policies: rez})
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

String.prototype.stripSlashes = function(){
    return this.replace(/\\(.)/mg, "$1");
};



inter=function(interval, min, max){
    var no=(max-min)/timetoms(interval);
    var ret =[];
    for(var i=no; i>=0; i--){
        ret.push({h:timetotime(interval, i), c:0})
    }
    return ret;
};

timetotime=function(interval, minus){
    return new Date((new Date()).getTime()-timetoms(interval)*minus).getTime();
};



timetoms=function(time){
    if(time=="minute") return 60*1000;
    else if(time=="hour") return 60*60*1000;
    else if(time=="day") return 24*60*60*1000;
    else if(time=="week") return 7*24*60*60*1000;
    else if(time=="month") return 30*24*60*60*1000;
    else if(time=="year") return 365*24*60*60*1000;
};







graphicsROT=function(service, interval, min, max, chart, width, height){
    Meteor.call("elasticsearchROTpoller", service,interval, function(arg){
        dati = dat.findOne({service: service, type:"ROT", interval: interval});
        if (dati ==undefined) return 1;
        var data = inter(interval, min, max);
        var i=0;
        while( i<dati.value.length){
            if(dati.value[i].key>=min) break;
            i++;
        }

        data.forEach(function(entry){

            if(dati.value[i]!=undefined && dati.value[i].key<entry.h){
                entry.c=dati.value[i].doc_count;
                i++;
            }
        });
        $(chart).attr("width",width);
        $(chart).attr("height",height);
        var vis = d3.select(chart),
            WIDTH = width,
            HEIGHT = height,
            MARGINS = {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            xScale = d3.time.scale().range([MARGINS.left, WIDTH - MARGINS.right]).domain(d3.extent(data, function(d) { return d.h; }));//.domain([d3.min(data,function(e){return e.h;}),d3.max(data,function(e){return e.h;})]),
        yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(data,function(e){return e.c;}),d3.max(data,function(e){return e.c;})]),
            xAxis = d3.svg.axis()
                .scale(xScale);
        //.tickFormat(d3.time.format("%H"));

        yAxis = d3.svg.axis()
            .scale(yScale);

        vis.selectAll("*").remove();



        vis.append("svg:g")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        vis.append("svg:g")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(yAxis);

        vis.append("svg:rect")
            .attr("x", MARGINS.left-6)
            .attr("y", HEIGHT-MARGINS.bottom)
            .attr("width", 6)
            .attr("height", 6)
            .attr("fill", "black");

        var lineGen = d3.svg.line()
            .x(function(d) {
                return xScale(d.h);
            })
            .y(function(d) {
                return yScale(d.c);
            });

        vis.append('svg:path')
            .attr('d', lineGen(data))
            .attr('stroke', 'green')
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        vis.append("text")
            .attr("transform", "translate(" + (WIDTH / 2) + " ," + (HEIGHT-10) + ")")
            .style("text-anchor", "middle")
            .text("Date/Time");

        vis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x",0 - (HEIGHT / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Requests");

    });
};

graphicsTD=function(service, interval, chart, width, height){
    Meteor.call("elasticsearchTDpoller", service,interval, function(arg){
        dati = dat.findOne({service: service, type:"TD", interval: interval});
        if (dati ==undefined) return 1;
        var data=[];
        var i=0;
        while(i>=0){
            if(dati.value[i]==undefined) break;
            data.push({c:dati.value[i].doc_count, h:dati.value[i].key});
            i++;
        }
        $(chart).attr("width",width);
        $(chart).attr("height",height);
        var vis = d3.select(chart),
            WIDTH = width,
            HEIGHT = height,
            MARGINS = {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(data,function(e){return e.h;}),d3.max(data,function(e){return e.h;})]);//.domain([d3.min(data,function(e){return e.h;}),d3.max(data,function(e){return e.h;})]),
        yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(data,function(e){return e.c;}),d3.max(data,function(e){return e.c;})]),
            xAxis = d3.svg.axis()
                .scale(xScale);
        //.tickFormat(d3.time.format("%H"));

        yAxis = d3.svg.axis()
            .scale(yScale);


        vis.selectAll("*").remove();

        vis.append("svg:g")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        vis.append("svg:g")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(yAxis);


        vis.append("svg:rect")
            .attr("x", MARGINS.left-6)
            .attr("y", HEIGHT-MARGINS.bottom)
            .attr("width", 6)
            .attr("height", 6)
            .attr("fill", "black");

        var lineGen = d3.svg.line()
            .x(function(d) {
                return xScale(d.h);
            })
            .y(function(d) {
                return yScale(d.c);
            });

        vis.append('svg:path')
            .attr('d', lineGen(data))
            .attr('stroke', 'green')
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        vis.append("text")
            .attr("transform", "translate(" + (WIDTH / 2) + " ," + (HEIGHT-10) + ")")
            .style("text-anchor", "middle")
            .text("Time in ms");

        vis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x",0 - (HEIGHT / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Requests");

    });
};

graphicsfield=function(service, query, chart, width, height){
    Meteor.call("elasticsearchMESTApoller", service, query, function(res){
        obj=dat.findOne({type:query,service: service});
        if (obj ==undefined) return 1;
        $(chart).attr("width",width);
        $(chart).attr("height",height);
        d3.select(chart).selectAll("*").remove();
        var legendRectSize = 18;
        var legendSpacing = 4;
        var radius = Math.min(width, height) / 2;

        var color = d3.scale.category20b();

        var svg = d3.select(chart)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + (width / 2) +
                ',' + (height / 2) + ')');

        var arc = d3.svg.arc()
            .outerRadius(radius);

        var pie = d3.layout.pie()
            .value(function(d) { return d.doc_count; })
            .sort(null);

        var path = svg.selectAll('path')
            .data(pie(obj.value))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function(d, i) {
                return color(d.data.key);
            });


        var legend = svg.selectAll('.legend')                     
            .data(color.domain())                                   
            .enter()                                                
            .append('g')                                            
            .attr('class', 'legend')                                
            .attr('transform', function(d, i) {                     
                var height = legendRectSize + legendSpacing;          
                var offset =  height * color.domain().length / 2;     
                var horz = -2 * legendRectSize +200;                       
                var vert = i * height - offset;                       
                return 'translate(' + horz + ',' + vert + ')';        
            });                                                     

        legend.append('rect')                                     
            .attr('width', legendRectSize)                          
            .attr('height', legendRectSize)                         
            .style('fill', color)                                   
            .style('stroke', color);                                

        legend.append('text')                                     
            .attr('x', legendRectSize + legendSpacing)              
            .attr('y', legendRectSize - legendSpacing)              
            .text(function(d) { return d; });                       

    });
};

//######################################################NEW

graphicsROTW=function(interval, min, max, chart, width, height){
    Meteor.call("elasticsearchROTpollerW",interval, function(arg){
        var service = "_undefined";
        dati = dat.findOne({service: service, type:"ROT", interval: interval});
        if (dati ==undefined) return 1;
        var data = inter(interval, min, max);
        var i=0;
        while( i<dati.value.length){
            if(dati.value[i].key>=min) break;
            i++;
        }

        data.forEach(function(entry){

            if(dati.value[i]!=undefined && dati.value[i].key<entry.h){
                entry.c=dati.value[i].doc_count;
                i++;
            }
        });
        $(chart).attr("width",width);
        $(chart).attr("height",height);
        var vis = d3.select(chart),
            WIDTH = width,
            HEIGHT = height,
            MARGINS = {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            xScale = d3.time.scale().range([MARGINS.left, WIDTH - MARGINS.right]).domain(d3.extent(data, function(d) { return d.h; }));//.domain([d3.min(data,function(e){return e.h;}),d3.max(data,function(e){return e.h;})]),
        yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(data,function(e){return e.c;}),d3.max(data,function(e){return e.c;})]),
            xAxis = d3.svg.axis()
                .scale(xScale);
        //.tickFormat(d3.time.format("%H"));

        yAxis = d3.svg.axis()
            .scale(yScale);

        vis.selectAll("*").remove();


        vis.append("svg:g")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        vis.append("svg:g")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(yAxis);

        vis.append("svg:rect")
            .attr("x", MARGINS.left-6)
            .attr("y", HEIGHT-MARGINS.bottom)
            .attr("width", 6)
            .attr("height", 6)
            .attr("fill", "black");


        var lineGen = d3.svg.line()
            .x(function(d) {
                return xScale(d.h);
            })
            .y(function(d) {
                return yScale(d.c);
            });

        vis.append('svg:path')
            .attr('d', lineGen(data))
            .attr('stroke', 'green')
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        vis.append("text")
            .attr("transform", "translate(" + (WIDTH / 2) + " ," + (HEIGHT-10) + ")")
            .style("text-anchor", "middle")
            .text("Date/Time");

        vis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x",0 - (HEIGHT / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Requests");

    });
};

graphicsTDW=function(interval, chart, width, height){
    Meteor.call("elasticsearchTDpollerW",interval, function(arg){
        var service = "_undefined";
        dati = dat.findOne({service: service, type:"TD", interval: interval});
        if (dati ==undefined) return 1;
        var data=[];
        var i=0;
        while(i>=0){
            if(dati.value[i]==undefined) break;
            data.push({c:dati.value[i].doc_count, h:dati.value[i].key});
            i++;
        }
        $(chart).attr("width",width);
        $(chart).attr("height",height);
        var vis = d3.select(chart),
            WIDTH = width,
            HEIGHT = height,
            MARGINS = {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(data,function(e){return e.h;}),d3.max(data,function(e){return e.h;})]);//.domain([d3.min(data,function(e){return e.h;}),d3.max(data,function(e){return e.h;})]),
        yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(data,function(e){return e.c;}),d3.max(data,function(e){return e.c;})]),
            xAxis = d3.svg.axis()
                .scale(xScale);
        //.tickFormat(d3.time.format("%H"));

        yAxis = d3.svg.axis()
            .scale(yScale);

        vis.selectAll("*").remove();


        vis.append("svg:g")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        vis.append("svg:g")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(yAxis);


        vis.append("svg:rect")
            .attr("x", MARGINS.left-6)
            .attr("y", HEIGHT-MARGINS.bottom)
            .attr("width", 6)
            .attr("height", 6)
            .attr("fill", "black");


        var lineGen = d3.svg.line()
            .x(function(d) {
                return xScale(d.h);
            })
            .y(function(d) {
                return yScale(d.c);
            });

        vis.append('svg:path')
            .attr('d', lineGen(data))
            .attr('stroke', 'green')
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        vis.append("text")
            .attr("transform", "translate(" + (WIDTH / 2) + " ," + (HEIGHT-10) + ")")
            .style("text-anchor", "middle")
            .text("Time in ms");

        vis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x",0 - (HEIGHT / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Requests");

    });
};

graphicsfieldW=function( query, chart, width, height){
    Meteor.call("elasticsearchMESTApollerW", query, function(res){
        var service = "_undefined";
        obj=dat.findOne({type:query,service: service});
        if (obj ==undefined) return 1;
        $(chart).attr("width",width);
        $(chart).attr("height",height);
        d3.select(chart).selectAll("*").remove();

        var legendRectSize = 18;
        var legendSpacing = 4;
        var radius = Math.min(width, height) / 2;

        var color = d3.scale.category20b();

        var svg = d3.select(chart)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + (width/ 2) +
                ',' + (height / 2) + ')');

        var arc = d3.svg.arc()
            .outerRadius(radius);

        var pie = d3.layout.pie()
            .value(function(d) { return d.doc_count; })
            .sort(null);

        var path = svg.selectAll('path')
            .data(pie(obj.value))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function(d, i) {
                return color(d.data.key);
            });


        var legend = svg.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
                var height = legendRectSize + legendSpacing;
                var offset =  height * color.domain().length / 2;
                var horz = -2 * legendRectSize +200;
                var vert = i * height - offset;
                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', color)
            .style('stroke', color);

        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function(d) { return d; });

    });
};