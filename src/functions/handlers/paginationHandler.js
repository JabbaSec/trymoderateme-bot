const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = (client) => {
  client.paginationEmbed = async (interaction, fields, options = {}) => {
    const maxPerPage = options.maxPerPage || 5;
    const color = options.color || "#8AC7DB";
    const title = options.title || "";

    let page = 1;
    const totalPages = Math.ceil(fields.length / maxPerPage);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(totalPages <= 1)
    );

    const embedMessage = async (page) => {
      const start = (page - 1) * maxPerPage;
      const end = start + maxPerPage;
      const paginatedFields = fields.slice(start, end);

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${title} - Page ${page}/${totalPages}`)
        .addFields(paginatedFields);
      return embed;
    };

    await interaction.reply({
      embeds: [await embedMessage(page)],
      components: [row],
    });

    client.pages = client.pages || new Map();

    client.pages.set(interaction.id, {
      page,
      fields,
      totalPages,
      originalEmbed: await embedMessage(page),
    });
  };
};
