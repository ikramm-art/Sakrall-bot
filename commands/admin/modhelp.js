import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("modhelp")
  .setDescription("Menu bantuan khusus admin & moderator");

export async function execute(interaction) {

  // 🔐 Permission check
  if (
    !interaction.member.permissions.has(
      PermissionFlagsBits.Administrator
    ) &&
    !interaction.member.permissions.has(
      PermissionFlagsBits.ManageGuild
    )
  ) {
    return interaction.reply({
      content: "❌ Command ini hanya untuk admin & moderator.",
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle("🛡️ Moderator Command Panel")
    .setDescription("Command khusus staff server")
    .addFields(
      {
        name: "🔨 Moderation",
        value:
          "**/clean** – Hapus pesan\n" +
          "**/ban** – Ban member\n" +
          "**/kick** – Kick member"
      },
      {
        name: "⚙️ Utilities",
        value:
          "**/userinfo** – Investigasi user\n" +
          "**/stats** – Statistik server"
      }
    )
    .setFooter({ text: "Restricted Access • Staff Only" })
    .setTimestamp();

  return interaction.reply({
    embeds: [embed],
    ephemeral: true
  });
}
