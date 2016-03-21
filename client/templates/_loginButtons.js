Template._loginButtons.events({
    'click #login-name-link': function(){
        $("#login-dropdown-list").show();
    },
    'click .login-close-text': function(){
        $("#login-dropdown-list").hide();
        $(".login-changepassword").hide();
        $("#login-buttons-open-change-password").show();
        $("#login-buttons-logout").show();
        $("#password-changed").hide();
    },
    'click #login-buttons-logout': function(){
        Meteor.logout();
    },
    'click #login-buttons-open-change-password': function(){
        $(".login-changepassword").show();
        $("#login-buttons-open-change-password").hide();
        $("#login-buttons-logout").hide();
    },
    'click #login-buttons-do-change-password': function(){

        oldPassword = $("#login-old-password")[0].value;
        newPassword = $("#login-password")[0].value;
        if(oldPassword!=newPassword && newPassword.length>5)  Accounts.changePassword(oldPassword, newPassword, function(Error){
            if(Error!= undefined) alert(Error.message);
            else {
                $(".login-changepassword").hide();
                $("#password-changed").show();
            }
        } );
        else alert("Ihr Passwort ist zu kurz (Mindestens sechs Zeichen) oder Sie haben in beiden Feldern das selbe Passwort verwendet.")

    }
});
Template._loginButtons.rendered=function(){
    $("#login-dropdown-list").hide();
    $("#password-changed").hide();
    $(".login-changepassword").hide();
};
