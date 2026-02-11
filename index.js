import { data as modHelpData, execute as modHelpExecute } from "./commands/admin/modhelp.js";
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
 intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ],
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
  .setDescription("Informasi user")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("Pilih user")
      .setRequired(false)
  ),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Bot mengirim pesan sesuai teks kamu")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Pesan yang ingin dikirim bot")
        .setRequired(true)
    ),

    modHelpData,
    serverStatsData
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
**/say** - Bot repeat your message
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

  // =====================
  // SLASH COMMAND
  // =====================
  if (interaction.isChatInputCommand()) {

    // /ping
    if (interaction.commandName === "ping") {
      return interaction.reply("😂 Lem!");
    }

    // /about
    if (interaction.commandName === "about") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🤖 About Bot")
        .setDescription("Bot Discord menggunakan discord.js v14");

      return interaction.reply({ embeds: [embed] });
    }

    // /stats
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

    // /modHelp
    if (interaction.commandName === "modhelp") {
      return modHelpExecute(interaction);
    }

    // /serverstats
    if (interaction.commandName === "serverstats") {
      return serverStatsExecute(interacion);
    }

    // =====================
    // /userinfo OMNISCIENT
    // =====================
    if (interaction.commandName === "userinfo") {

      const target =
        interaction.options.getUser("user") || interaction.user;

      const member = await interaction.guild.members
        .fetch(target.id)
        .catch(() => null);

      const createdAt = Math.floor(target.createdTimestamp / 1000);
      const joinedAt = member
        ? Math.floor(member.joinedTimestamp / 1000)
        : null;

      const accountDays = Math.floor(
        (Date.now() - target.createdTimestamp) / 86400000
      );

      const joinDays = member
        ? Math.floor((Date.now() - member.joinedTimestamp) / 86400000)
        : 0;

      const roles = member
        ? member.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .map(r => r.toString())
        : [];

      const perms = member ? member.permissions.toArray() : [];

      const dangerousPerms = perms.filter(p =>
        ["Administrator", "BanMembers", "KickMembers", "ManageGuild"].includes(p)
      );

      // 🧠 Behavior Analysis
      let behavior = [];
      if (accountDays < 14) behavior.push("🆕 Newly created account");
      if (joinDays < 2) behavior.push("📥 Recently joined server");
      if (!member?.presence) behavior.push("👻 Silent presence");
      if (roles.length <= 1) behavior.push("🎭 Minimal role footprint");
      if (!behavior.length) behavior.push("✅ Normal behavioral pattern");

      // 📊 Trust Score
      let trust = 100;
      if (accountDays < 30) trust -= 30;
      if (joinDays < 7) trust -= 20;
      if (dangerousPerms.length > 0) trust += 10;
      if (roles.length <= 1) trust -= 10;
      trust = Math.max(0, Math.min(trust, 100));

      // ☣️ Threat Index
      let threat = 0;
      if (trust < 40) threat += 4;
      if (trust < 20) threat += 3;
      if (dangerousPerms.length >= 2) threat += 2;
      if (dangerousPerms.includes("Administrator")) threat += 3;
      threat = Math.min(threat, 10);

      const threatStatus =
        threat <= 2 ? "🟢 Low"
        : threat <= 5 ? "🟡 Medium"
        : threat <= 8 ? "🔴 High"
        : "☠️ Critical";

      const embed = new EmbedBuilder()
        .setColor(threat >= 6 ? 0xff0000 : 0x5865f2)
        .setTitle("🧿 User Intelligence Profile")
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: "👤 Identity",
            value: `**User:** ${target.tag}\n**ID:** ${target.id}`
          },
          {
            name: "⏱️ Timeline",
            value:
              `**Account Created:** <t:${createdAt}:R>\n` +
              `**Joined Server:** ${joinedAt ? `<t:${joinedAt}:R>` : "Unknown"}`
          },
          {
            name: "🎭 Roles",
            value: roles.length ? roles.join(" ") : "None"
          },
          {
            name: "🧠 Behavior Profile",
            value: behavior.join("\n")
          },
          {
            name: "📊 Trust Score",
            value: `${trust}/100`,
            inline: true
          },
          {
            name: "☣️ Threat Index",
            value: `${threat}/10 (${threatStatus})`,
            inline: true
          }
        )
        .setFooter({ text: "Omniscient System • Risk Analysis" })
        .setTimestamp();

      const avatarButton = new ButtonBuilder()
        .setLabel("🖼 View Avatar")
        .setStyle(ButtonStyle.Link)
        .setURL(target.displayAvatarURL({ size: 1024 }));

      return interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(avatarButton)]
      });
    }

    // /say
    if (interaction.commandName === "say") {
      const text = interaction.options.getString("text");
      return interaction.reply({ content: text });
    }

    // /help
    if (interaction.commandName === "help") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("📖 Help Menu")
        .setDescription("Pilih kategori command di bawah 👇");

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

  // =====================
  // SELECT MENU
  // =====================
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

  // =====================
  // BUTTON
  // =====================
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

