import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";

// =====================
// CLIENT
// =====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// =====================
// SLASH COMMAND
// =====================
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Cek respon bot"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Menu bantuan bot"),
];

// =====================
// REGISTER COMMAND
// =====================
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🚀 Register slash command...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log("✅ Slash command terdaftar");
  } catch (err) {
    console.error(err);
  }
})();

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`🤖 Bot online sebagai ${client.user.tag}`);
});

// =====================
// INTERACTION HANDLER
// =====================
client.on("interactionCreate", async interaction => {

  // ===== SLASH COMMAND =====
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "ping") {
      await interaction.reply("😂 Lem!");
    }

    if (interaction.commandName === "help") {
      const helpEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("📖 Help Menu")
        .setDescription("Pilih kategori command di bawah");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("help_menu")
        .setPlaceholder("Select a command category")
        .addOptions([
          {
            label: "Information",
            value: "info",
            description: "Ping, About, Stats"
          },
          {
            label: "Other",
            value: "other",
            description: "Vote, Clean, Premium"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [helpEmbed],
        components: [row]
      });
    }
  }

  // ===== SELECT MENU =====
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "help_menu") {
      let embed;

      if (interaction.values[0] === "info") {
        embed = new EmbedBuilder()
          .setTitle("ℹ️ Information Commands")
          .setDescription(`
**/ping** – Check bot latency  
**/about** – Bot information  
**/stats** – Bot statistics
          `);
      }

      if (interaction.values[0] === "other") {
        embed = new EmbedBuilder()
          .setTitle("📦 Other Commands")
          .setDescription(`
**/vote** – Support the bot  
**/clean** – Delete messages  
**/premium** – Support project
          `);
      }

      await interaction.update({ embeds: [embed] });
    }
  }
});

// =====================
client.login(process.env.DISCORD_TOKEN);
