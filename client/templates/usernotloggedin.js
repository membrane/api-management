/**
 * Created by oerder on 07.12.15.
 */
Meteor.subscribe("UserAccounts", {
    onReady: function () {
        var digest = Package.sha.SHA256("admin");
        Meteor.call("checkPassword", digest, function(err, result) {
            if (result && Meteor.users.findOne({"emails.address" : 'admin@example.com'})!=undefined) {
                $("#firstlogin").removeClass("hidden");
            }
        }); },
    onError: function () { console.log("ERROR 12:", arguments); }
});


Template.usernotloggedin.events({
    'submit form': function(event) {
        event.preventDefault();
        emailVar = event.target.username.value;
        passwordVar = event.target.password.value;
        if (event.target.registerMe.value === "true") {
            surnameVar = event.target.surname.value;
            firstnameVar = event.target.firstname.value;
            Meteor.call("createuser", emailVar, passwordVar, surnameVar, firstnameVar);
            $("#registerhint").removeClass("hidden");
            $("#afterregister").addClass("hidden");
            $(".btn").prop("disabled", true);
        }
        else {
             Meteor.loginWithPassword(emailVar, passwordVar, function(error){
                 if(error!=undefined) {
                     $("#loginhint")[0].innerHTML="Login failed! \n stated Reason: "+error.message;
                     $("#loginhint").removeClass("hidden");

                 }
             });
        }
    },
    'click #reg': function(){
        $("#register").removeClass("hidden");
        $("#signin-form_id").hide();
        $(".btn").prop("disabled", false);
        $("#username_id")[0].value="";
        $("#username_id")[1].value="";
        $("#surname_id")[0].value="";
        $("#firstname_id")[0].value="";
        $("#password_id")[0].value="";
        $("#password_id")[1].value="";
    },
    'click #anm': function(){
        $("#register").addClass("hidden");
        $("#signin-form_id").show();
        $(".btn").prop("disabled", false);
        $("#afterregister").removeClass("hidden");
    }
});