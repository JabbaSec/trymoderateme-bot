const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Manage user warnings")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a warning to a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to warn")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for warning")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View warnings for a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to view warnings for")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a warning from a user")
        .addStringOption((option) =>
          option
            .setName("warningid")
            .setDescription("ID of the warning to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("clear")
        .setDescription("Clears all of a user's warnings.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to clear warnings for")
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
        const reason = interaction.options.getString("reason");

        const warningEmbed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.tag}`,
            iconURL: interaction.member.displayAvatarURL(),
          })
          .setColor("#ff0000")
          .setThumbnail(`${user.displayAvatarURL()}`)
          .setTitle(":warning: Warning")
          .setFields([
            {
              name: `${user.tag}`,
              value: `${reason}`,
            },
          ]);

        await client.handleModeration.addModAction(
          user.id,
          interaction.user.id,
          "Warning",
          reason
        );
        await interaction.reply(`Warned ${user.tag} for: ${reason}`);

        await user
          .send({
            content: `:warning: You have been warned!\nReason: ${reason}`,
          })
          .catch(() =>
            interaction.followUp({
              content: `[WARNING] I cannot DM that user.`,
            })
          );

        interaction.guild.channels.cache
          .get(process.env.BOT_LOGGING)
          .send({ embeds: [warningEmbed] })
          .catch((err) => console.log("[WARN] Error with sending the embed."));

        break;
      }

      case "view": {
        const user = interaction.options.getUser("user");
        const modActions = await client.handleModeration.getModActions(user.id);
        const warnings = modActions.filter(
          (action) => action.type === "Warning"
        );

        if (warnings.length === 0) {
          return await interaction.reply(`${user.tag} has no warnings.`);
        }

        const warningFields = warnings.map((warning) => ({
          name: `Warning ID: ${warning._id}`,
          value: `Reason: ${warning.reason}\nTimestamp: ${new Date(
            warning.timestamp
          ).toLocaleString()}`,
          inline: false,
        }));

        await client.paginationEmbed(interaction, warningFields, {
          title: `Warnings for ${user.tag}`,
          color: "#FFA500",
        });
        break;
      }

      case "remove": {
        const warningId = interaction.options.getString("warningid");
        await client.handleModeration.removeModAction(warningId);
        await interaction.reply(`Removed warning with ID ${warningId}`);
        break;
      }

      case "clear": {
        const user = interaction.options.getUser("user");
        await client.handleModeration.clearModAction(user.id, "Warning");
        await interaction.reply(
          `All warnings have been cleared from ${user.tag}`
        );
        break;
      }
    }
  },
};
