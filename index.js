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
  ButtonStyle,
  PermissionsBitField
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
// COMMANDS
// =====================
const commands = [

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Cek respon bot"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Menu bantuan bot"),

  new SlashCommandBuilder()
    .setName("about")
    .setDescription("Informasi tentang bot"),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Statistik bot"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Informasi user (Omniscient)")
    .addUserOption(option =>
      option.setName("user").setDescription("Pilih user")
    ),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Bot mengirim pesan sesuai teks kamu")
    .addStringOption(option =>
      option.setName("text").setDescription("Pesan").setRequired(true)
    ),

  // 🔥 MOD HELP
  new SlashCommandBuilder()
    .setName("modhelp")
    .setDescription("Omniscient Moderator Control Panel"),
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
  console.log("✅ Slash commands registered");
})();

// =====================
// HELP DATA
// =====================
const helpData = {
  info: [
    {
      title: "ℹ️ Information (1/2)",
      description:
        "**/ping** – Check latency\n" +
        "**/about** – Bot information\n" +
        "**/stats** – Bot statistics"
    },
    {
      title: "ℹ️ Information (2/2)",
      description:
        "**/userinfo** – User intelligence\n" +
        "**/say** – Bot repeat message"
    }
  ]
};

// =====================
// MOD HELP DATA
// =====================
const modPages = [
  {
    title: "🧿 Omniscient Mod Panel (1/3)",
    description:
      "**Clearance:** MODERATOR+\n" +
      "**System Core:** ONLINE",
    fields: [
      {
        name: "🛡️ Moderation",
        value:
          "`/ban` – Ban user\n" +
          "`/kick` – Kick user\n" +
          "`/timeout` – Timeout member\n" +
          "`/clean` – Purge messages"
      }
    ]
  },
  {
    title: "🧠 Intelligence System (2/3)",
    description: "Advanced monitoring tools.",
    fields: [
      {
        name: "🔍 Analysis",
        value:
          "`/userinfo` – Threat scan\n" +
          "`/auditlog` – Server log"
      }
    ]
  },
  {
    title: "☠️ Protocol Warning (3/3)",
    description: "All actions are logged.",
    fields: [
      {
        name: "⚠️ Notice",
        value:
          "Abuse of power will trigger\n" +
          "**automatic review**"
      }
    ]
  }
];

// =====================
// BUTTON BUILDER
// =====================
function buildNavButtons(prefix, page, max) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${prefix}_first`)
      .setLabel("⏮")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId(`${prefix}_prev`)
      .setLabel("◀")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId(`${prefix}_next`)
      .setLabel("▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === max),

    new ButtonBuilder()
      .setCustomId(`${prefix}_last`)
      .setLabel("⏭")
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
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("🤖 About Bot")
            .setDescription("Discord bot powered by discord.js v14")
        ]
      });
    }

    // /stats
    if (interaction.commandName === "stats") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("📊 Bot Stats")
            .addFields(
              { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
              { name: "Users", value: `${client.users.cache.size}`, inline: true },
              { name: "Ping", value: `${client.ws.ping} ms`, inline: true }
            )
        ]
      });
    }

    // =====================
    // /modhelp (ADMIN & MOD)
    // =====================
    if (interaction.commandName === "modhelp") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageGuild |
          PermissionsBitField.Flags.Administrator |
          PermissionsBitField.Flags.BanMembers |
          PermissionsBitField.Flags.KickMembers
        )
      ) {
        return interaction.reply({
          content: "⛔ Clearance denied. Moderator only.",
          ephemeral: true
        });
      }

      const page = 0;
      const data = modPages[page];

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(data.title)
        .setDescription(data.description)
        .addFields(data.fields)
        .setFooter({ text: "Omniscient System • Moderator Interface" })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        components: [buildNavButtons("mod", page, modPages.length - 1)],
        ephemeral: true
      });
    }

    // /say
    if (interaction.commandName === "say") {
      return interaction.reply({
        content: interaction.options.getString("text")
      });
    }

    // /help
    if (interaction.commandName === "help") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("📖 Help Menu")
        .setDescription("Pilih kategori command");

      const select = new StringSelectMenuBuilder()
        .setCustomId("help_select")
        .setPlaceholder("Select category")
        .addOptions([{ label: "Information", value: "info" }]);

      return interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(select)]
      });
    }
  }

  // =====================
  // SELECT MENU
  // =====================
  if (interaction.isStringSelectMenu() && interaction.customId === "help_select") {
    const data = helpData[interaction.values[0]][0];
    return interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle(data.title)
          .setDescription(data.description)
      ],
      components: []
    });
  }

  // =====================
  // MOD BUTTON
  // =====================
  if (interaction.isButton() && interaction.customId.startsWith("mod_")) {

    let page =
      parseInt(interaction.message.embeds[0].title.match(/\((\d+)/)[1]) - 1;

    const max = modPages.length - 1;

    if (interaction.customId === "mod_first") page = 0;
    if (interaction.customId === "mod_prev") page--;
    if (interaction.customId === "mod_next") page++;
    if (interaction.customId === "mod_last") page = max;

    const data = modPages[page];

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle(data.title)
      .setDescription(data.description)
      .addFields(data.fields)
      .setFooter({ text: "Omniscient System • Moderator Interface" })
      .setTimestamp();

    return interaction.update({
      embeds: [embed],
      components: [buildNavButtons("mod", page, max)]
    });
  }
});

// =====================
client.login(process.env.DISCORD_TOKEN);
