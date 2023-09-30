const mongoose = require("mongoose");

const ModerationSchema = new mongoose.Schema({
  discordId: String, // ID of the user the action is taken against
  modId: String, // ID of the moderator taking the action
  type: String, // 'Warning', 'Mute', or 'Note'
  reason: String,
  timestamp: Date,
});

module.exports = mongoose.model("Moderation", ModerationSchema);
