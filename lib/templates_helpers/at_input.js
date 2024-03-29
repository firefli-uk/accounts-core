AT.prototype.atInputRendered = [function(){
    const fieldId = this.data._id;

    const parentData = Template.currentData();
    const state = (parentData && parentData.state) || AccountsTemplates.getState();

    if (AccountsTemplates.options.focusFirstInput) {
      const firstVisibleInput = _.find(AccountsTemplates.getFields(), function(f){
        return _.contains(f.visible, state);
      });

      if (firstVisibleInput && firstVisibleInput._id === fieldId) {
        this.$("input#at-field-" + fieldId).focus();
      }
  }
}];

AT.prototype.atInputHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled({});
    },
    showLabels: function() {
        return AccountsTemplates.options.showLabels;
    },
    displayName: function() {
        const parentData = Template.parentData();
        const state = (parentData && parentData.state) || AccountsTemplates.getState();
        const displayName = this.getDisplayName(state);
        return T9n.get(displayName, markIfMissing=false);
    },
    optionalText: function(){
        return "(" + T9n.get(AccountsTemplates.texts.optionalField, markIfMissing=false) + ")";
    },
    templateName: function() {
        if (this.template)
            return this.template;
        if (this.type === "checkbox")
            return "atCheckboxInput";
        if (this.type === "select")
            return "atSelectInput";
        if (this.type === "radio")
            return "atRadioInput";
        if (this.type === "hidden")
            return "atHiddenInput";
        return "atTextInput";
    },
    values: function(){
        const id = this._id;
        return _.map(this.select, function(select){
            const s = _.clone(select);
            s._id = id + "-" + select.value;
            s.id = id;
            return s;
        });
    },
    errorText: function() {
        const err = this.getStatus();
        return T9n.get(err, markIfMissing=false);
    },
    placeholder: function() {
        if (AccountsTemplates.options.showPlaceholders) {
            const parentData = Template.parentData();
            const state = (parentData && parentData.state) || AccountsTemplates.getState();
            const placeholder = this.getPlaceholder(state);
            return T9n.get(placeholder, markIfMissing=false);
        }
    },
};

AT.prototype.atInputEvents = {
    "focusin input": function(event, t){
        const field = Template.currentData();
        field.clearStatus();
    },
    "focusout input, change select": function(event, t){
        const field = Template.currentData();
        const fieldId = field._id;
        const rawValue = field.getValue(t);
        const value = field.fixValue(rawValue);
        // Possibly updates the input value
        if (value !== rawValue) {
            field.setValue(t, value);
        }

        // Client-side only validation
        if (!field.validation)
            return;
        const parentData = Template.parentData();
        const state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        // Special case for password confirmation
        if (value && fieldId === "password_again"){
            if (value !== $("#at-field-password").val())
                return field.setError(AccountsTemplates.texts.errors.pwdMismatch);
        }
        field.validate(value);
    },
    "keyup input": function(event, t){
        const field = Template.currentData();
        // Client-side only continuous validation
        if (!field.continuousValidation)
            return;
        const parentData = Template.parentData();
        const state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        const fieldId = field._id;
        const rawValue = field.getValue(t);
        const value = field.fixValue(rawValue);
        // Possibly updates the input value
        if (value !== rawValue) {
            field.setValue(t, value);
        }
        // Special case for password confirmation
        if (value && fieldId === "password_again"){
            if (value !== $("#at-field-password").val())
                return field.setError(AccountsTemplates.texts.errors.pwdMismatch);
        }
        field.validate(value);
    },
};
