const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

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

    const embed = new EmbedBuilder()
      .setTitle(`Moderation history for ${user.tag}`)
      .addFields(recordFields);

    await interaction.reply({ embeds: [embed] });
  },
};
