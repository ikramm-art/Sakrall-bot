import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
  ChannelType
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("serverstats")
  .setDescription("👑 GOD MODE Server Dashboard")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {

  await interaction.deferReply();

  const guild = interaction.guild;
  await guild.members.fetch();

  const totalMembers = guild.memberCount;
  const bots = guild.members.cache.filter(m => m.user.bot).size;
  const humans = totalMembers - bots;
  const online = guild.members.cache.filter(
    m => m.presence && m.presence.status !== "offline"
  ).size;

  const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

  const roles = guild.roles.cache.size;

  const staff = guild.members.cache.filter(m =>
    m.permissions.has(PermissionFlagsBits.Administrator) ||
    m.permissions.has(PermissionFlagsBits.ManageGuild)
  ).size;

  const boostLevel = guild.premiumTier;
  const boostCount = guild.premiumSubscriptionCount;

  const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

  const boostBar = "🟣".repeat(boostLevel) + "⚪".repeat(3 - boostLevel);

  // ================= EMBEDS =================

  const overviewEmbed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`👑 ${guild.name}`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .addFields(
      {
        name: "👥 Members",
        value:
          `Total: **${totalMembers}**\n` +
          `Humans: **${humans}**\n` +
          `Bots: **${bots}**\n` +
          `Online: **${online}**`,
        inline: true
      },
      {
        name: "📁 Channels",
        value:
          `Text: **${textChannels}**\n` +
          `Voice: **${voiceChannels}**\n` +
          `Categories: **${categories}**`,
        inline: true
      },
      {
        name: "👑 Staff & Roles",
        value:
          `Staff: **${staff}**\n` +
          `Roles: **${roles}**`,
        inline: true
      }
    )
    .setFooter({ text: "Page 1/3 • Overview" })
    .setTimestamp();

  const activityEmbed = new EmbedBuilder()
    .setColor(0x00b894)
    .setTitle("📊 Activity Analytics")
    .addFields(
      {
        name: "🚀 Boost Status",
        value:
          `Level: **${boostLevel}**\n` +
          `Boosts: **${boostCount}**\n` +
          `Progress: ${boostBar}`
      },
      {
        name: "📅 Server Created",
        value: createdAt
      }
    )
    .setFooter({ text: "Page 2/3 • Activity" })
    .setTimestamp();

  const systemEmbed = new EmbedBuilder()
    .setColor(0xff7675)
    .setTitle("🛡️ System & Security")
    .addFields(
      {
        name: "🔐 Verification Level",
        value: `**${guild.verificationLevel}**`,
        inline: true
      },
      {
        name: "📜 Explicit Filter",
        value: `**${guild.explicitContentFilter}**`,
        inline: true
      },
      {
        name: "👑 Owner",
        value: `<@${guild.ownerId}>`
      }
    )
    .setFooter({ text: "Page 3/3 • System" })
    .setTimestamp();

  // ================= COMPONENTS =================

  const selectMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("stats_menu")
      .setPlaceholder("📂 Choose Dashboard Page")
      .addOptions([
        { label: "Overview", value: "overview", emoji: "👑" },
        { label: "Activity", value: "activity", emoji: "📊" },
        { label: "System", value: "system", emoji: "🛡️" }
      ])
  );

  const refreshButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("refresh_stats")
      .setLabel("🔄 Refresh")
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.editReply({
    embeds: [overviewEmbed],
    components: [selectMenu, refreshButton]
  });

  const collector = interaction.channel.createMessageComponentCollector({
    time: 90000
  });

  collector.on("collect", async (i) => {

    if (!i.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return i.reply({
        content: "❌ Only staff can use this panel.",
        ephemeral: true
      });
    }

    if (i.isStringSelectMenu()) {
      if (i.values[0] === "overview") {
        await i.update({ embeds: [overviewEmbed] });
      }
      if (i.values[0] === "activity") {
        await i.update({ embeds: [activityEmbed] });
      }
      if (i.values[0] === "system") {
        await i.update({ embeds: [systemEmbed] });
      }
    }

    if (i.isButton()) {
      if (i.customId === "refresh_stats") {
        await i.update({ embeds: [overviewEmbed] });
      }
    }

  });

  collector.on("end", async () => {
    await interaction.editReply({ components: [] });
  });
}
