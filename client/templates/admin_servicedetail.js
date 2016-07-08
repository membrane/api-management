Meteor.subscribe("dat");
Meteor.subscribe("services");


function getserviceid(){
    return $(location).attr('pathname').split("/")[2];

}
serviceid=getserviceid();


Template.admin_servicedetail.created= function(){
    serviceid = this.data.id;
};

Template.admin_servicedetail.rendered=function(){
    _obj=services.findOne({_id: serviceid});
    $(".ROTchart").replaceWith("<svg class=\"ROTchart\"></svg>");
    //console.log(timetoms($(".interval")[0].value),parseInt($(".count")[0].value));
    graphicsROT(_obj.name,
        $(".interval")[0].value,
        (new Date()).getTime()-timetoms($(".interval")[0].value)*parseInt($(".count")[0].value),
        (new Date()).getTime(),
        ".ROTchart",
        1200,
        300);
    $(".TDchart").replaceWith("<svg class=\"TDchart\"></svg>");
    //console.log(timetoms($(".interval")[0].value),parseInt($(".count")[0].value));
    graphicsTD(_obj.name,
        $(".interval")[0].value,
        ".TDchart",
        1200,
        300);
    graphicsfield(_obj.name,
            $(".query")[0].value,
            ".QUchart",
            800,
            300);
};

Template.admin_servicedetail.helpers({
    'service': function(){
        return services.findOne({_id: serviceid});
    }
 });

Template.admin_servicedetail.events({
    'click .calc': function (event){
        _obj=services.findOne({_id: serviceid});
        //console.log(timetoms($(".interval")[0].value),parseInt($(".count")[0].value));
        graphicsROT(_obj.name,
            $(".interval")[0].value,
            (new Date()).getTime()-timetoms($(".interval")[0].value)*parseInt($(".count")[0].value),
            (new Date()).getTime(),
            ".ROTchart",
            1200,
            300);
    },
    'click .calc2': function (event){
        _obj=services.findOne({_id: serviceid});
        //console.log(timetoms($(".interval")[0].value),parseInt($(".count")[0].value));
        graphicsfield(_obj.name,
            $(".query")[0].value,
            ".QUchart",
            800,
            300);
    }
});
/**
 * Created by predic8 on 27.06.16.
 */
