const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: {
    id: "previous",
  },
  async execute(interaction) {
    const client = interaction.client;
    const state = client.pages.get(interaction.message.interaction.id);

    if (!state) return;

    if (state.page > 1) {
      state.page--;

      const start = (state.page - 1) * 5;
      const end = start + 5;
      const paginatedFields = state.fields.slice(start, end);

      const newEmbed = state.originalEmbed
        .setFields(paginatedFields)
        .setTitle(`Page ${state.page}/${state.totalPages}`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(state.page === 1),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(state.page === state.totalPages)
      );

      await interaction.update({ embeds: [newEmbed], components: [row] });
    }
  },
};
