/* global
  AccountsTemplates: false
*/
"use strict";

Meteor.methods({
  ATRemoveService: async function(serviceName) {
    check(serviceName, String);

    var userId = this.userId;

    if (userId) {
      var user = await Meteor.users.findOneAsync(userId);
      var numServices = _.keys(user.services).length; // including "resume"
      var unset = {};

      if (numServices === 2) {
        throw new Meteor.Error(403, AccountsTemplates.texts.errors.cannotRemoveService, {});
      }

      unset["services." + serviceName] = "";
      await Meteor.users.updateAsync(userId, {$unset: unset});
    }
  },
});
