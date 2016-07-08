Template.admin_dashboard.helpers({
    users: function(){
        return Meteor.users.find({"profile.status":"unapproved"}).fetch();
    }
});
Template.admin_dashboard.rendered=function(){
    
    
    graphicsROTW($(".interval")[0].value,
        (new Date()).getTime()-timetoms($(".interval")[0].value)*parseInt($(".count")[0].value),
        (new Date()).getTime(),
        ".ROTchart",
        1200,
        300);
    
    graphicsTDW(
        $(".interval")[0].value,
        ".TDchart",
        1200,
        300);
    graphicsfieldW(
        $(".query")[0].value,
        ".QUchart",
        750,
        300);
};
Template.admin_dashboard.events({
    'click .calc': function (event){
        graphicsROTW($(".interval")[0].value,
            (new Date()).getTime()-timetoms($(".interval")[0].value)*parseInt($(".count")[0].value),
            (new Date()).getTime(),
            ".ROTchart",
            1200,
            300);
    },
    'click .calc2': function (event){
        graphicsfieldW($(".query")[0].value,
            ".QUchart",
            750,
            300);
    }
});