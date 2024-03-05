AT.prototype.atPwdFormBtnHelpers = {
    submitDisabled: function(){
        const disable = _.chain(AccountsTemplates.getFields())
            .map(function(field){
                return field.hasError() || field.isValidating();
            })
            .some()
            .value()
        ;
        if (disable)
            return "disabled";
    },
    buttonText: function() {
        const parentData = Template.currentData();
        const state = (parentData && parentData.state) || AccountsTemplates.getState();
        return T9n.get(AccountsTemplates.texts.button[state], markIfMissing=false);
    },
};
