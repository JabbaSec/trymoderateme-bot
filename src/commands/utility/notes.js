const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("notes")
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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("clear")
        .setDescription("Clears all of a user's notes.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to clear notes for")
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    const hasPermission = await client.checkPermissions(
      interaction,
      "Moderator"
    );
    if (!hasPermission) return;

    switch (subcommand) {
      case "add": {
        const user = interaction.options.getUser("user");
        const note = interaction.options.getString("note");

        const noteEmbed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.member.displayAvatarURL(),
          })
          .setColor("#ffff00")
          .setThumbnail(`${user.displayAvatarURL()}`)
          .setTitle(":pencil: Note")
          .setFields([
            {
              name: `${user.tag}`,
              value: `${note}`,
            },
          ]);

        await client.handleModeration.addModAction(
          user.id,
          interaction.user.id,
          "Note",
          note
        );
        await interaction.reply(`Note added to ${user.tag}.`);

        interaction.guild.channels.cache
          .get(process.env.BOT_LOGGING)
          .send({ embeds: [noteEmbed] })
          .catch((err) => console.log("[NOTE] Error with sending the embed."));

        break;
      }

      case "view": {
        const user = interaction.options.getUser("user");
        const modActions = await client.handleModeration.getModActions(user.id);
        const notes = modActions.filter((action) => action.type === "Note");

        if (notes.length === 0) {
          return await interaction.reply(`${user.tag} has no notes.`);
        }

        const noteFields = notes.map((note) => ({
          name: `Note ID: ${note._id}`,
          value: `Reason: ${note.reason}\nTimestamp: ${new Date(
            note.timestamp
          ).toLocaleString()}`,
          inline: false,
        }));

        await client.paginationEmbed(interaction, noteFields, {
          title: `Notes for ${user.tag}`,
          color: "#ffff00",
        });
        break;
      }

      case "remove": {
        const noteId = interaction.options.getString("noteid");
        await client.handleModeration.removeModAction(noteId);
        await interaction.reply(`Removed note with ID ${noteId}`);
        break;
      }

      case "clear": {
        const user = interaction.options.getUser("user");
        await client.handleModeration.clearModAction(user.id, "Note");
        await interaction.reply(`All notes have been cleared from ${user.tag}`);
        break;
      }
    }
  },
};
