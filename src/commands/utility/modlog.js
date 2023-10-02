const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modlog")
    .setDescription("View all notes/ warnings/ mutes for a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to view")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { client } = interaction;
    const user = interaction.options.getUser("user");

    const modActions = await client.handleModeration.getModActions(user.id);

    if (modActions.length === 0) {
      await interaction.reply(`No moderation history found for ${user.tag}.`);
      return;
    }

    const recordFields = modActions.map((record) => ({
      name: `${record.type} - ID: ${record._id}`,
      value: `Reason: ${record.reason}\nModerator: ${
        record.modId
      }\nTimestamp: ${new Date(record.timestamp).toLocaleString()}`,
      inline: false,
    }));

    const options = {
      color: "#FF0000",
      title: `Moderation history for ${user.tag}`,
    };

    await client.paginationEmbed(interaction, recordFields, options);
  },
};
