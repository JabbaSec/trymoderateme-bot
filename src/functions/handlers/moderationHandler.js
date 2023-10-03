const Moderation = require("../../events/mongo/schema/ModerationSchema");

module.exports = (client) => {
  client.handleModeration = {
    addModAction: async (discordId, modId, type, reason) => {
      const modAction = new Moderation({
        discordId,
        modId,
        type,
        reason,
        timestamp: new Date(),
      });
      await modAction.save();
    },

    getModActions: async (discordId) => {
      return await Moderation.find({ discordId });
    },

    removeModAction: async (id) => {
      await Moderation.findByIdAndDelete(id);
    },

    clearModAction: async (discordId, type) => {
      await Moderation.deleteMany({ discordId, type });
    },
  };
};
