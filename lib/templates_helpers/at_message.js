AT.prototype.atMessageHelpers = {
    message: function() {
        const messageText = AccountsTemplates.state.form.get("message");
        if (messageText) {
            return T9n.get(messageText, markIfMissing=false);
        }
    },
};