import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
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
// COMMAND
// =====================
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Cek respon bot"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Menu bantuan bot"),

  // ===== BASIC COMMAND (INFORMATION) =====
  new SlashCommandBuilder()
    .setName("about")
    .setDescription("Informasi tentang bot"),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Statistik bot"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Informasi user"),
];

// =====================
// REGISTER COMMAND
// =====================
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands.map(c => c.toJSON()) }
  );
  console.log("✅ Slash command registered");
})();

// =====================
// HELP DATA
// =====================
const helpData = {
  info: [
    {
      title: "ℹ️ Information (1/2)",
      description: `
**/ping** – Check latency  
**/about** – Bot information  
**/stats** – Bot statistics
      `
    },
    {
      title: "ℹ️ Information (2/2)",
      description: `
**/userinfo** – User information
      `
    }
  ],
  other: [
    {
      title: "📦 Other (1/1)",
      description: `
**/vote** – Support bot  
**/clean** – Delete messages
      `
    }
  ]
};

// =====================
// BUTTON BUILDER
// =====================
function getButtons(category, page, max) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`help_${category}_first`)
      .setLabel("<<")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId(`help_${category}_prev`)
      .setLabel("<")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId(`help_${category}_next`)
      .setLabel(">")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === max),

    new ButtonBuilder()
      .setCustomId(`help_${category}_last`)
      .setLabel(">>")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === max)
  );
}

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// =====================
// INTERACTION
// =====================
client.on("interactionCreate", async interaction => {

  // ===== SLASH COMMAND =====
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "ping") {
      return interaction.reply("😂 Lem!");
    }

    if (interaction.commandName === "about") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🤖 About Bot")
        .setDescription("Bot Discord menggunakan discord.js v14");

      return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "stats") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("📊 Bot Stats")
        .addFields(
          { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
          { name: "Users", value: `${client.users.cache.size}`, inline: true },
          { name: "Ping", value: `${client.ws.ping} ms`, inline: true }
        );

      return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "userinfo") {
      const user = interaction.user;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("👤 User Info")
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "Username", value: user.tag, inline: true },
          { name: "User ID", value: user.id, inline: true }
        );

      return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "help") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("📖 Help Menu")
        .setDescription("𝙈𝙖𝙪 𝙥𝙖𝙠𝙖𝙞 𝙘𝙤𝙢𝙢𝙖𝙣𝙙 𝙖𝙥𝙖? 𝙋𝙞𝙡𝙞𝙝 𝙠𝙖𝙩𝙚𝙜𝙤𝙧𝙞𝙣𝙮𝙖 𝙙𝙪𝙡𝙪 𝙮𝙖");

      const select = new StringSelectMenuBuilder()
        .setCustomId("help_select")
        .setPlaceholder("Select category")
        .addOptions([
          { label: "Information", value: "info" },
          { label: "Other", value: "other" }
        ]);

      return interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(select)]
      });
    }
  }

  // ===== SELECT MENU =====
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "help_select") {
      const category = interaction.values[0];
      const page = 0;

      const data = helpData[category][page];
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(data.title)
        .setDescription(data.description);

      return interaction.update({
        embeds: [embed],
        components: [
          interaction.message.components[0],
          getButtons(category, page, helpData[category].length - 1)
        ]
      });
    }
  }

  // ===== BUTTON =====
  if (interaction.isButton()) {
    const [_, category, action] = interaction.customId.split("_");

    let page = parseInt(
      interaction.message.embeds[0].title.match(/\((\d+)/)[1]
    ) - 1;

    const max = helpData[category].length - 1;

    if (action === "first") page = 0;
    if (action === "prev") page--;
    if (action === "next") page++;
    if (action === "last") page = max;

    const data = helpData[category][page];
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(data.title)
      .setDescription(data.description);

    return interaction.update({
      embeds: [embed],
      components: [
        interaction.message.components[0],
        getButtons(category, page, max)
      ]
    });
  }
});

// =====================
client.login(process.env.DISCORD_TOKEN);
