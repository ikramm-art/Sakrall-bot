import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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
// HELP PAGES
// =====================
const helpPages = [
  {
    title: "ℹ️ Information",
    description: `
**/ping** – Check bot latency  
**/about** – Bot information  
**/stats** – Bot statistics  
**/dashboard** – Bot dashboard  
**/changelogs** – Latest updates
    `
  },
  {
    title: "📦 Other",
    description: `
**/vote** – Support the bot  
**/clean** – Delete messages  
**/premium** – Donate  
**/leaderboard** – View rankings
    `
  }
];

// =====================
// BUTTON BUILDER
// =====================
function getButtons(page, maxPage) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("first")
      .setLabel("<<")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("<")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId("next")
      .setLabel(">")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === maxPage),

    new ButtonBuilder()
      .setCustomId("last")
      .setLabel(">>")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === maxPage)
  );
}

// =====================
// INTERACTION HANDLER
// =====================
client.on("interactionCreate", async interaction => {

  // ===== SLASH COMMAND =====
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "ping") {
      return interaction.reply("😂 Lem!");
    }

    if (interaction.commandName === "help") {
      const page = 0;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(helpPages[page].title)
        .setDescription(helpPages[page].description)
        .setFooter({ text: `Page ${page + 1} / ${helpPages.length}` });

      return interaction.reply({
        embeds: [embed],
        components: [getButtons(page, helpPages.length - 1)]
      });
    }
  }

  // ===== BUTTON PAGINATION =====
  if (interaction.isButton()) {
    let page = Number(
      interaction.message.embeds[0].footer.text.split(" ")[1]
    ) - 1;

    const maxPage = helpPages.length - 1;

    if (interaction.customId === "first") page = 0;
    if (interaction.customId === "prev") page--;
    if (interaction.customId === "next") page++;
    if (interaction.customId === "last") page = maxPage;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(helpPages[page].title)
      .setDescription(helpPages[page].description)
      .setFooter({ text: `Page ${page + 1} / ${helpPages.length}` });

    return interaction.update({
      embeds: [embed],
      components: [getButtons(page, maxPage)]
    });
  }
});

// =====================
client.login(process.env.DISCORD_TOKEN);
