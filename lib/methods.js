/* global
  AccountsTemplates: false
*/
"use strict";

Meteor.methods({
  ATRemoveService: async function(serviceName) {
    check(serviceName, String);

    const userId = this.userId;

    if (userId) {
      const user = await Meteor.users.findOneAsync(userId);
      const numServices = _.keys(user.services).length; // including "resume"
      const unset = {};

      if (numServices === 2) {
        throw new Meteor.Error(403, AccountsTemplates.texts.errors.cannotRemoveService, {});
      }

      unset["services." + serviceName] = "";
      await Meteor.users.updateAsync(userId, {$unset: unset});
    }
  },
});
