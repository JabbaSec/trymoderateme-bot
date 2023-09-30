// src/commands/utility/notes.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("note")
    .setDescription("Manage user notes")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a note to a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to add a note to")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("note")
            .setDescription("The note to add")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View notes for a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to view notes for")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a note from a user")
        .addStringOption((option) =>
          option
            .setName("noteid")
            .setDescription("ID of the note to remove")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const { client } = interaction;
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "add": {
        const user = interaction.options.getUser("user");
        const note = interaction.options.getString("note");
        await client.handleModeration.addModAction(
          user.id,
          interaction.user.id,
          "Note",
          note
        );
        await interaction.reply(`Added note to ${user.tag}: ${note}`);
        break;
      }
      case "view": {
        const user = interaction.options.getUser("user");
        const modActions = await client.handleModeration.getModActions(user.id);
        const notes = modActions.filter((action) => action.type === "Note");
        const noteFields = notes.map((note) => ({
          name: `Note ID: ${note._id}`,
          value: `Note: ${note.reason}\nTimestamp: ${new Date(
            note.timestamp
          ).toLocaleString()}`,
          inline: false,
        }));
        const embed = new EmbedBuilder()
          .setTitle(`Notes for ${user.tag}`)
          .addFields(noteFields);
        await interaction.reply({ embeds: [embed] });
        break;
      }
      case "remove": {
        const noteId = interaction.options.getString("noteid");
        await client.handleModeration.removeModAction(noteId);
        await interaction.reply(`Removed note with ID ${noteId}`);
        break;
      }
    }
  },
};
