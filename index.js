import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

// =====================
// CLIENT (HANYA SEKALI)
// =====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// =====================
// DAFTAR COMMAND
// =====================
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Cek respon bot"),
];

// =====================
// REGISTER SLASH COMMAND
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
// BOT READY
// =====================
client.once("ready", () => {
  console.log(`🤖 Bot online sebagai ${client.user.tag}`);
});

// =====================
// COMMAND HANDLER
// =====================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.deferReply();
    await interaction.editReply("😂Lem!");
  }
});

// =====================
client.login(process.env.DISCORD_TOKEN);
