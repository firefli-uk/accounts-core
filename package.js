'use strict';

Package.describe({
  summary: 'Meteor sign up and sign in templates core package.',
  version: '1.17.1',
  name: 'useraccounts:core',
  git: 'https://github.com/meteor-compat/useraccounts-core',
});

Npm.depends({
  "meteor-accounts-t9n": "2.6.0",
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@2.4', "METEOR@3.0-beta.0"]);

  api.use([
    'accounts-base',
    'service-configuration',
    'check',
    'underscore',
    'reactive-var',
    'ecmascript',
  ], ['client', 'server']);

  api.use([
    'blaze@2.5.0||3.0.0-alpha300.17',
    'reactive-dict',
    'templating',
    'jquery@3.0.0'
  ], 'client');

  api.use([
    'fetch'
  ], 'server');

  api.imply([
    'accounts-base',
  ], ['client', 'server']);

  api.imply([
    'templating',
  ], ['client']);

  api.addFiles([
    'lib/field.js',
    'lib/core.js',
    'lib/server.js',
    'lib/methods.js',
    'lib/server_methods.js',
    'lib/T9n.js',
  ], ['server']);

  api.addFiles([
    'lib/utils.js',
    'lib/field.js',
    'lib/core.js',
    'lib/client.js',
    'lib/templates_helpers/at_error.js',
    'lib/templates_helpers/at_form.js',
    'lib/templates_helpers/at_input.js',
    'lib/templates_helpers/at_nav_button.js',
    'lib/templates_helpers/at_oauth.js',
    'lib/templates_helpers/at_pwd_form.js',
    'lib/templates_helpers/at_pwd_form_btn.js',
    'lib/templates_helpers/at_pwd_link.js',
    'lib/templates_helpers/at_reCaptcha.js',
    'lib/templates_helpers/at_resend_verification_email_link.js',
    'lib/templates_helpers/at_result.js',
    'lib/templates_helpers/at_sep.js',
    'lib/templates_helpers/at_signin_link.js',
    'lib/templates_helpers/at_signup_link.js',
    'lib/templates_helpers/at_social.js',
    'lib/templates_helpers/at_terms_link.js',
    'lib/templates_helpers/at_title.js',
    'lib/templates_helpers/at_message.js',
    'lib/templates_helpers/ensure_signed_in.html',
    'lib/templates_helpers/ensure_signed_in.js',
    'lib/methods.js',
    'lib/T9n.js',
  ], ['client']);

  api.export([
    'AccountsTemplates', 'T9n'
  ], ['client', 'server']);
});

Package.onTest(function (api) {
  api.use('useraccounts:core@1.16.3');

  api.use([
    'accounts-password',
    'tinytest',
    'test-helpers',
    'underscore',
  ], ['client', 'server']);

  api.addFiles([
    'tests/tests.js',
  ], ['client', 'server']);
});
