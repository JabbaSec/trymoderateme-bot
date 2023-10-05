module.exports = (client) => {
  client.checkPermissions = async (interaction, role) => {
    const member = interaction.member;

    switch (role) {
      case "Verified":
        if (
          member.roles.cache.has(process.env.VERIFIED_ROLE_ID) ||
          member.id === process.env.JABBA_ID
        ) {
          return true;
        } else {
          await interaction.reply({
            content: "You are not Verified.",
            ephemeral: true,
          });
          return false;
        }

      case "Moderator":
        if (
          member.roles.cache.has(process.env.MODERATOR_ROLE_ID) ||
          member.id === process.env.JABBA_ID
        ) {
          return true;
        } else {
          await interaction.reply({
            content: "You are not a Moderator.",
            ephemeral: true,
          });
          return false;
        }

      case "Administrator":
        if (
          member.roles.cache.has(process.env.ADMIN_ROLE_ID) ||
          member.id === process.env.JABBA_ID
        ) {
          return true;
        } else {
          await interaction.reply({
            content: "You are not an Administrator.",
            ephemeral: true,
          });
          return false;
        }

      default:
        console.error("Invalid role specified in checkPermissions");
        await interaction.reply({
          content: "An error occurred while checking permissions.",
          ephemeral: true,
        });
        return false;
    }
  };
};
