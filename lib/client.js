/* global
  AT: false
*/
'use strict';

// Allowed Internal (client-side) States
AT.prototype.STATES = [
  'changePwd', // Change Password
  'enrollAccount', // Account Enrollment
  'forgotPwd', // Forgot Password
  'hide', // Nothing displayed
  'resetPwd', // Reset Password
  'signIn', // Sign In
  'signUp', // Sign Up
  'verifyEmail', // Email verification
  'resendVerificationEmail', // Resend verification email
];

AT.prototype._loginType = '';

// Flag telling whether the whole form should appear disabled
AT.prototype._disabled = false;

// State validation
AT.prototype._isValidState = function (value) {
  return _.contains(this.STATES, value);
};

// Flags used to avoid clearing errors and redirecting to previous route when
// signing in/up as a results of a call to ensureSignedIn
AT.prototype.avoidRedirect = false;
AT.prototype.avoidClearError = false;

// Token to be provided for routes like reset-password and enroll-account
AT.prototype.paramToken = null;

AT.prototype.loginType = function () {
  return this._loginType;
};

AT.prototype.getparamToken = function () {
  return this.paramToken;
};

// Getter for current state
AT.prototype.getState = function () {
  return this.state.form.get('state');
};

// Getter for disabled string
AT.prototype.disabled = function (fallback) {
  return this.state.form.equals('disabled', true) ? 'disabled' : fallback;
};

// Setter for disabled state
AT.prototype.setDisabled = function (value) {
  check(value, Boolean);
  return this.state.form.set('disabled', value);
};

// Setter for current state
AT.prototype.setState = function (state, callback) {
  check(state, String);

  if (
    !this._isValidState(state) ||
    (this.options.forbidClientAccountCreation && state === 'signUp')
  ) {
    throw new Meteor.Error(
      500,
      'Internal server error',
      'accounts-templates-core package got an invalid state value!',
    );
  }

  this.state.form.set('state', state);
  if (!this.avoidClearError) {
    this.clearState();
  }
  this.avoidClearError = false;

  if (_.isFunction(callback)) {
    callback();
  }
};

AT.prototype.clearState = function () {
  _.each(this._fields, function (field) {
    field.clearStatus();
  });

  const form = this.state.form;

  form.set('error', null);
  form.set('result', null);
  form.set('message', null);

  AccountsTemplates.setDisabled(false);
};

AT.prototype.clearError = function () {
  this.state.form.set('error', null);
};

AT.prototype.clearResult = function () {
  this.state.form.set('result', null);
};

AT.prototype.clearMessage = function () {
  this.state.form.set('message', null);
};

// Moved here from ./core.js since migration to Meteor v3.0
AT.prototype.oauthServices = function () {
  // Extracts names of available services
  var names =
    (Accounts.oauth &&
      Accounts.loginServicesConfigured() &&
      Accounts.oauth.serviceNames()) ||
    [];

  // Extracts names of configured services
  var configuredServices = [];

  // Deprecate Accounts.loginServiceConfiguration in favor
  // of ServiceConfiguration.configurations
  // https://github.com/meteor-useraccounts/core/issues/503
  if (ServiceConfiguration.configurations) {
    configuredServices = ServiceConfiguration.configurations
      .find()
      .map((config) => config.service);
  }

  return AT.prototype.oauthServicesHelper(names, configuredServices);
};

// Initialization
AT.prototype.init = function () {
  console.warn(
    '[AccountsTemplates] There is no more need to call AccountsTemplates.init()! Simply remove the call ;-)',
  );
};

AT.prototype._init = function () {
  if (this._initialized) {
    return;
  }

  const usernamePresent = this.hasField('username');
  const emailPresent = this.hasField('email');

  if (usernamePresent && emailPresent) {
    this._loginType = 'username_and_email';
  } else {
    this._loginType = usernamePresent ? 'username' : 'email';
  }

  if (this._loginType === 'username_and_email') {
    // Possibly adds the field username_and_email in case
    // it was not configured
    if (!this.hasField('username_and_email')) {
      this.addField({
        _id: 'username_and_email',
        type: 'text',
        displayName: 'usernameOrEmail',
        placeholder: 'usernameOrEmail',
        required: true,
      });
    }
  }

  // Only in case password confirmation is required
  if (this.options.confirmPassword) {
    // Possibly adds the field password_again in case
    // it was not configured
    if (!this.hasField('password_again')) {
      const pwdAgain = _.clone(this.getField('password'));

      pwdAgain._id = 'password_again';
      pwdAgain.displayName = {
        'default': 'passwordAgain',
        changePwd: 'newPasswordAgain',
        resetPwd: 'newPasswordAgain',
      };
      pwdAgain.placeholder = {
        'default': 'passwordAgain',
        changePwd: 'newPasswordAgain',
        resetPwd: 'newPasswordAgain',
      };
      this.addField(pwdAgain);
    }
  } else {
    if (this.hasField('password_again')) {
      throw new Error(
        'AccountsTemplates: a field password_again was added but confirmPassword is set to false!',
      );
    }
  }

  // Possibly adds the field current_password in case
  // it was not configured
  if (this.options.enablePasswordChange) {
    if (!this.hasField('current_password')) {
      this.addField({
        _id: 'current_password',
        type: 'password',
        displayName: 'currentPassword',
        placeholder: 'currentPassword',
        required: true,
      });
    }
  }

  // Ensuser the right order of special fields
  var moveFieldAfter = function (fieldName, referenceFieldName) {
    const fieldIds = AccountsTemplates.getFieldIds();
    const refFieldId = _.indexOf(fieldIds, referenceFieldName);
    // In case the reference field is not present, just return...
    if (refFieldId === -1) {
      return;
    }

    const fieldId = _.indexOf(fieldIds, fieldName);
    // In case the sought field is not present, just return...
    if (fieldId === -1) {
      return;
    }

    if (fieldId !== -1 && fieldId !== refFieldId + 1) {
      // removes the field
      const field = AccountsTemplates._fields.splice(fieldId, 1)[0];
      // push the field right after the reference field position
      const newFieldIds = AccountsTemplates.getFieldIds();
      const newReferenceFieldId = _.indexOf(newFieldIds, referenceFieldName);
      AccountsTemplates._fields.splice(newReferenceFieldId + 1, 0, field);
    }
  };

  // Ensuser the right order of special fields
  const moveFieldBefore = function (fieldName, referenceFieldName) {
    const fieldIds = AccountsTemplates.getFieldIds();
    const refFieldId = _.indexOf(fieldIds, referenceFieldName);
    // In case the reference field is not present, just return...
    if (refFieldId === -1) {
      return;
    }

    const fieldId = _.indexOf(fieldIds, fieldName);
    // In case the sought field is not present, just return...
    if (fieldId === -1) {
      return;
    }

    if (fieldId !== -1 && fieldId !== refFieldId - 1) {
      // removes the field
      const field = AccountsTemplates._fields.splice(fieldId, 1)[0];
      // push the field right after the reference field position
      const newFieldIds = AccountsTemplates.getFieldIds();
      const newReferenceFieldId = _.indexOf(newFieldIds, referenceFieldName);
      AccountsTemplates._fields.splice(newReferenceFieldId, 0, field);
    }
  };

  // The final order should be something like:
  // - username
  // - email
  // - username_and_email
  // - password
  // - password_again
  //
  // ...so lets do it in reverse order...
  moveFieldAfter('username_and_email', 'username');
  moveFieldAfter('username_and_email', 'email');
  moveFieldBefore('current_password', 'password');
  moveFieldAfter('password', 'current_password');
  moveFieldAfter('password_again', 'password');

  // Sets visibility condition and validation flags for each field
  const gPositiveValidation = !!AccountsTemplates.options.positiveValidation;
  const gNegativeValidation = !!AccountsTemplates.options.negativeValidation;
  const gShowValidating = !!AccountsTemplates.options.showValidating;
  const gContinuousValidation =
    !!AccountsTemplates.options.continuousValidation;
  const gNegativeFeedback = !!AccountsTemplates.options.negativeFeedback;
  const gPositiveFeedback = !!AccountsTemplates.options.positiveFeedback;

  _.each(this._fields, function (field) {
    // Visibility
    switch (field._id) {
      case 'current_password':
        field.visible = ['changePwd'];
        break;
      case 'email':
        field.visible = ['forgotPwd', 'signUp', 'resendVerificationEmail'];
        if (AccountsTemplates.loginType() === 'email') {
          field.visible.push('signIn');
        }
        break;
      case 'password':
        field.visible = [
          'changePwd',
          'enrollAccount',
          'resetPwd',
          'signIn',
          'signUp',
        ];
        break;
      case 'password_again':
        field.visible = ['changePwd', 'enrollAccount', 'resetPwd', 'signUp'];
        break;
      case 'username':
        field.visible = ['signUp'];
        if (AccountsTemplates.loginType() === 'username') {
          field.visible.push('signIn');
        }
        break;
      case 'username_and_email':
        field.visible = [];
        if (AccountsTemplates.loginType() === 'username_and_email') {
          field.visible.push('signIn');
        }
        break;
      default:
        field.visible = ['signUp'];
    }

    // Validation
    const positiveValidation = field.positiveValidation;
    if (_.isUndefined(positiveValidation)) {
      field.positiveValidation = gPositiveValidation;
    }

    const negativeValidation = field.negativeValidation;
    if (_.isUndefined(negativeValidation)) {
      field.negativeValidation = gNegativeValidation;
    }

    field.validation = field.positiveValidation || field.negativeValidation;
    if (_.isUndefined(field.continuousValidation)) {
      field.continuousValidation = gContinuousValidation;
    }

    field.continuousValidation = field.validation && field.continuousValidation;
    if (_.isUndefined(field.negativeFeedback)) {
      field.negativeFeedback = gNegativeFeedback;
    }

    if (_.isUndefined(field.positiveFeedback)) {
      field.positiveFeedback = gPositiveFeedback;
    }

    field.feedback = field.negativeFeedback || field.positiveFeedback;
    // Validating icon
    const showValidating = field.showValidating;
    if (_.isUndefined(showValidating)) {
      field.showValidating = gShowValidating;
    }

    // Custom Template
    if (field.template) {
      if (field.template in Template) {
        Template[field.template].helpers(AccountsTemplates.atInputHelpers);
      } else {
        console.warn(
          '[UserAccounts] Warning no template ' + field.template + ' found!',
        );
      }
    }
  });

  // Initializes reactive states
  const form = new ReactiveDict();

  form.set('disabled', false);
  form.set('state', 'signIn');
  form.set('result', null);
  form.set('error', null);
  form.set('message', null);
  this.state = {
    form: form,
  };

  // Possibly subscribes to extended user data (to get the list of registered services...)
  if (this.options.showAddRemoveServices) {
    Meteor.subscribe('userRegisteredServices');
  }

  //Check that reCaptcha site keys are available and no secret keys visible
  if (this.options.showReCaptcha) {
    let atSiteKey = null;
    let atSecretKey = null;
    let settingsSiteKey = null;
    let settingsSecretKey = null;

    if (AccountsTemplates.options.reCaptcha) {
      atSiteKey = AccountsTemplates.options.reCaptcha.siteKey;
      atSecretKey = AccountsTemplates.options.reCaptcha.secretKey;
    }

    if (
      Meteor.settings &&
      Meteor.settings.public &&
      Meteor.settings.public.reCaptcha
    ) {
      settingsSiteKey = Meteor.settings.public.reCaptcha.siteKey;
      settingsSecretKey = Meteor.settings.public.reCaptcha.secretKey;
    }

    if (atSecretKey || settingsSecretKey) {
      //erase the secret key
      if (atSecretKey) {
        AccountsTemplates.options.reCaptcha.secretKey = null;
      }

      if (settingsSecretKey) {
        Meteor.settings.public.reCaptcha.secretKey = null;
      }

      const loc = atSecretKey
        ? 'User Accounts configuration!'
        : 'Meteor settings!';
      throw new Meteor.Error(
        401,
        'User Accounts: DANGER - reCaptcha private key leaked to client from ' +
          loc +
          ' Provide the key in server settings ONLY.',
      );
    }

    if (!atSiteKey && !settingsSiteKey) {
      throw new Meteor.Error(
        401,
        'User Accounts: reCaptcha site key not found! Please provide it or set showReCaptcha to false.',
      );
    }
  }

  // Marks AccountsTemplates as initialized
  this._initialized = true;
};

AT.prototype.linkClick = function (route) {
  if (AccountsTemplates.disabled()) {
    return;
  }

  AccountsTemplates.setState(route);

  if (AccountsTemplates.options.focusFirstInput) {
    const firstVisibleInput = _.find(this.getFields(), function (f) {
      return _.contains(f.visible, route);
    });

    if (firstVisibleInput) {
      $('input#at-field-' + firstVisibleInput._id).focus();
    }
  }
};

AT.prototype.logout = function () {
  const onLogoutHook = AccountsTemplates.options.onLogoutHook;

  Meteor.logout(function () {
    if (onLogoutHook) {
      onLogoutHook();
    }
  });
};

AT.prototype.submitCallback = function (error, state, onSuccess) {
  const onSubmitHook = AccountsTemplates.options.onSubmitHook;

  if (onSubmitHook) {
    onSubmitHook(error, state);
  }

  if (error) {
    if (_.isObject(error.details)) {
      // If error.details is an object, we may try to set fields errors from it
      _.each(error.details, function (error, fieldId) {
        AccountsTemplates.getField(fieldId).setError(error);
      });
    } else {
      let err = 'error.accounts.Unknown error';

      if (error.reason) {
        err = error.reason;
      }

      if (err.substring(0, 15) !== 'error.accounts.') {
        err = 'error.accounts.' + err;
      }

      AccountsTemplates.state.form.set('error', [err]);
    }

    AccountsTemplates.setDisabled(false);
    // Possibly resets reCaptcha form
    if (state === 'signUp' && AccountsTemplates.options.showReCaptcha) {
      grecaptcha.reset();
    }
  } else {
    if (onSuccess) {
      onSuccess();
    }

    if (state) {
      AccountsTemplates.setDisabled(false);
    }
  }
};

AccountsTemplates = new AT();

// Initialization
Meteor.startup(function () {
  AccountsTemplates._init();
});
