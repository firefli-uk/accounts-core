AT.prototype.atFormHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled({});
    },
    hide: function(){
        const state = this.state || AccountsTemplates.getState();
        return state === "hide";
    },
    showTitle: function(next_state){
        const state = next_state || this.state || AccountsTemplates.getState();
        if (Meteor.userId() && state === "signIn")
          return false;
        return !!AccountsTemplates.texts.title[state];
    },
    showOauthServices: function(next_state){
        const state = next_state || this.state || AccountsTemplates.getState();
        if (!(state === "signIn" || state === "signUp"))
            return false;
        const services = AccountsTemplates.oauthServices();
        if (!services.length)
            return false;
        if (Meteor.userId())
            return AccountsTemplates.options.showAddRemoveServices;
        return true;
    },
    showServicesSeparator: function(next_state){
        const pwdService = Package["accounts-password"] !== undefined;
        const state = next_state || this.state || AccountsTemplates.getState();
        const rightState = (state === "signIn" || state === "signUp");
        return rightState && !Meteor.userId() && pwdService && AccountsTemplates.oauthServices().length;
    },
    showError: function(next_state) {
        return !!AccountsTemplates.state.form.get("error");
    },
    showResult: function(next_state) {
        return !!AccountsTemplates.state.form.get("result");
    },
    showMessage: function(next_state) {
        return !!AccountsTemplates.state.form.get("message");
    },
    showPwdForm: function(next_state) {
        if (Package["accounts-password"] === undefined)
            return false;
        const state = next_state || this.state || AccountsTemplates.getState();
        if ((state === "verifyEmail") || (state === "signIn" && Meteor.userId()))
            return false;
        return true;
    },
    showSignInLink: function(next_state){
        if (AccountsTemplates.options.hideSignInLink)
            return false;
        const state = next_state || this.state || AccountsTemplates.getState();
        if (AccountsTemplates.options.forbidClientAccountCreation && state === "forgotPwd")
            return true;
        return state === "signUp";
    },
    showSignUpLink: function(next_state){
        if  (AccountsTemplates.options.hideSignUpLink)
            return false;
        const state = next_state || this.state || AccountsTemplates.getState();
        return ((state === "signIn" && !Meteor.userId()) || state === "forgotPwd") && !AccountsTemplates.options.forbidClientAccountCreation;
    },
    showTermsLink: function(next_state){
        //TODO: Add privacyRoute and termsRoute as alternatives (the point of named routes is
        // being able to change the url in one place only)
        if (!!AccountsTemplates.options.privacyUrl || !!AccountsTemplates.options.termsUrl) {
            const state = next_state || this.state || AccountsTemplates.getState();
            if (state === "signUp" || state === "enrollAccount" ) {
              return true;
            }
        }
        /*
        if (state === "signIn"){
            var pwdService = Package["accounts-password"] !== undefined;
            if (!pwdService)
                return true;
        }
        */
        return false;
    },
    showResendVerificationEmailLink: function(){
        const parentData = Template.currentData();
        const state = (parentData && parentData.state) || AccountsTemplates.getState();
        return (state === "signIn" || state === "forgotPwd") && AccountsTemplates.options.showResendVerificationEmailLink;
    },
};
