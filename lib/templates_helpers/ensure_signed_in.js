
Template.ensureSignedIn.helpers({
  signedIn: function () {
    if (!Meteor.user()) {
      AccountsTemplates.setState(AccountsTemplates.options.defaultState, function(){
        const err = AccountsTemplates.texts.errors.mustBeLoggedIn;
        AccountsTemplates.state.form.set('error', [err]);
      });
      return false;
    } else {
      AccountsTemplates.clearError();
      return true;
    }
  }
});
