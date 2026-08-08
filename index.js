require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const express = require('express');

// --- Render Health Check Server ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🩺 Health check server running on port ${PORT}`);
});

// --- DG AI System Prompt ---
const DG_SYSTEM_PROMPT = `# 🚀 DG Develops — Everything You Need to Know

**DG Develops** is an independent developer ecosystem focused on building free, useful, and accessible tools for developers, creators, AI users, and gamers.

It started as a collection of personal projects and experiments and has grown into an ecosystem covering **AI, APIs, developer tools, Roblox development, automation, and community projects.**

## 🤖 DG AI

One of the main projects under DG Develops is **DG AI**, a free AI API designed to make AI accessible without complicated setup.

DG AI provides access to multiple AI models through a unified API and uses a **smart fallback system**. If one model or provider fails, the system can automatically attempt another available model.

The API is built using **Cloudflare Workers**, allowing it to run at the edge with a lightweight serverless architecture.

### Key features

* 🆓 Free to use
* 🔑 No API key required for public access
* 👤 No mandatory account required
* 🧠 Multiple AI models
* 🔄 Automatic model fallback
* ⚡ Edge-based infrastructure
* 🛡️ Rate limiting and abuse protection
* 📊 Usage limits and neuron-based controls
* 🌐 Simple HTTP API
* 🧪 Public playground for testing

Developers can integrate DG AI into websites, applications, bots, tools, and other projects.

## 🔌 DG AI API

The API acts as a common gateway between applications and different AI models.

Instead of every developer having to build separate integrations, they can send a request to DG AI and let the system handle model selection and fallback.

\`\`\`text
Your App
   ↓
DG AI API
   ↓
Request Validation
   ↓
Rate Limits
   ↓
Model Router
   ↓
AI Model
   ↓
Response
\`\`\`

If the selected model fails:

\`\`\`text
Model 1
   ↓
Failed
   ↓
Model 2
   ↓
Failed
   ↓
Model 3
   ↓
Success
\`\`\`

This makes applications more resilient to individual model/provider failures.

## 🎮 DG AI Discord Bot

Another part of the ecosystem is **DG AI — Discord Bot Edition**.

The bot brings DG AI directly into Discord using **slash commands**, allowing users to interact with AI without leaving their server.

The bot communicates with the DG AI API rather than having to independently implement every AI model.

\`\`\`text
Discord User
     ↓
/ask
     ↓
DG AI Discord Bot
     ↓
DG AI API
     ↓
Model Router
     ↓
AI Model
     ↓
Discord
\`\`\`

The bot is designed to eventually provide features such as AI conversations, model information, help commands, and other AI-powered utilities.

## 🛠️ Developer Tools

DG Develops isn't only about AI.

The ecosystem also contains various developer-focused projects, experiments, APIs, utilities, dashboards, and tools created to solve practical problems.

Some projects explore:

* 🌐 Web development
* 🤖 Artificial intelligence
* 📡 APIs
* ☁️ Cloudflare Workers
* 🎮 Roblox development
* 📊 Data and dashboards
* 💳 Billing/inventory systems
* 🧰 Developer utilities
* ⚙️ Automation

Many of these projects begin as experiments and can evolve into fully usable products.

## 🎮 Roblox Development

Roblox development is another major part of DG Develops.

Projects include games, experiments, backend systems, verification concepts, developer tools, and Roblox-related utilities.

The goal isn't just to make games, but also to experiment with how **Roblox can connect with external web services and APIs**.

## ☁️ Technology

DG Develops uses a wide range of technologies depending on the project.

Common technologies include:

* JavaScript
* HTML
* CSS
* Python
* Java
* Roblox Lua
* Cloudflare Workers
* REST APIs
* GitHub
* Netlify
* Render
* Chart.js
* Various AI APIs and model providers

The ecosystem is intentionally technology-flexible rather than being locked to one programming language or platform.

## 🔐 Security

Security is an important part of the ecosystem.

Public services use mechanisms such as:

* Rate limiting
* Request validation
* Usage controls
* Environment variables
* Secret management
* API protection
* Abuse prevention

Private credentials and secrets should never be placed directly into public source code.

## 🌍 Open Developer Ecosystem

DG Develops is intended to be useful not only as a collection of personal projects, but as an ecosystem where developers can **discover tools, experiment with APIs, build projects, and share what they create.**

The idea is simple:

> **Build useful things. Make them accessible. Keep experimenting.**

## 🚧 What's Next?

DG Develops is continuously evolving.

Future development can include:

* More AI models
* More APIs
* Better DG AI infrastructure
* DG AI Discord improvements
* More developer tools
* Better documentation
* More integrations
* Community-driven projects
* New experiments and products

## 🧑‍💻 The Philosophy

DG Develops isn't trying to be just another project repository.

It's a place to **build, experiment, learn, break things, fix them, and turn ideas into real products.**

From a small script to a production API, from a Roblox game to an AI-powered application — if it solves a problem or teaches something useful, it belongs in the DG Develops ecosystem.

### 🚀 DG Develops

**Build. Experiment. Ship. Repeat.**`;

// --- Discord Client Setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // Required to read messages for /summary
  ]
});

// --- Slash Commands Definition ---
const commands = [
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask DG AI anything about DG Develops!')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('What do you want to ask?')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('summary')
    .setDescription('Summarizes a Discord message using AI.')
    .addStringOption(option =>
      option.setName('message_url')
        .setDescription('The Discord message URL to summarize')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Sends a verification link to your DMs.'),

  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Sends an announcement to a specific channel.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the announcement in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('content')
        .setDescription('The announcement content')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mentions')
        .setDescription('Mentions (e.g. @everyone, @here, or @role)')
        .setRequired(false))
].map(cmd => cmd.toJSON());

// --- Bot Ready Event & Command Registration ---
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    console.log('⏳ Registering slash commands...');

    // Use applicationGuildCommands for instant update in your test server
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered successfully.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
});

// --- Helper: Call DG AI API (OpenAI Format) ---
async function fetchDGAI(prompt, systemPrompt) {
  // Construct the correct OpenAI-compatible endpoint
  const baseUrl = process.env.DG_API_URL.endsWith('/') 
      ? process.env.DG_API_URL.slice(0, -1) 
      : process.env.DG_API_URL;
  const endpoint = `${baseUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'agent', // The specific model ID requested
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();
  
  // Parse standard OpenAI response format
  return data.choices?.[0]?.message?.content || "No response text found.";
}

// --- Interaction Handler ---
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 1. /ask Command
  if (interaction.commandName === 'ask') {
    const prompt = interaction.options.getString('prompt');
    await interaction.deferReply();

    try {
      const aiReply = await fetchDGAI(prompt, DG_SYSTEM_PROMPT);
      // Discord limits messages to 2000 characters
      const finalReply = aiReply.length > 1950 ? aiReply.substring(0, 1950) + '...' : aiReply;
      await interaction.editReply(`**Question:** ${prompt}\n\n**DG AI:** ${finalReply}`);
    } catch (error) {
      console.error('Ask Error:', error);
      await interaction.editReply('⚠️ Sorry, I encountered an error while contacting the DG AI API.');
    }
  }

  // 2. /summary Command
  if (interaction.commandName === 'summary') {
    const messageUrl = interaction.options.getString('message_url');
    
    // Regex to extract Guild ID, Channel ID, and Message ID from Discord URL
    const match = messageUrl.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
    
    if (!match) {
      return interaction.reply({ content: '❌ Invalid Discord message URL. Please make sure it is a link to a specific message.', ephemeral: true });
    }

    const [, guildId, channelId, messageId] = match;
    await interaction.deferReply();

    try {
      const guild = await client.guilds.fetch(guildId);
      const channel = await guild.channels.fetch(channelId);
      const message = await channel.messages.fetch(messageId);

      if (!message.content) {
        return interaction.editReply('❌ The message has no text content to summarize.');
      }

      const summaryPrompt = `Please summarize the following Discord message:\n\n"${message.content}"`;
      const aiReply = await fetchDGAI(summaryPrompt, "You are a helpful assistant that summarizes Discord messages concisely.");
      
      const finalReply = aiReply.length > 1950 ? aiReply.substring(0, 1950) + '...' : aiReply;
      await interaction.editReply(`📝 **Summary of [message](${messageUrl}):**\n\n${finalReply}`);

    } catch (error) {
      console.error('Summary Error:', error);
      await interaction.editReply('⚠️ Could not fetch or summarize the message. Make sure the bot has access to the channel.');
    }
  }

  // 3. /verify Command
  if (interaction.commandName === 'verify') {
    const userId = interaction.user.id;
    await interaction.reply({ content: '✅ Check your DMs for the verification link!', ephemeral: true });

    try {
      const embed = new EmbedBuilder()
        .setTitle('🔐 Verification Required')
        .setDescription('Click the button below to verify your account via Cloudflare Turnstile.')
        .setColor('#5865F2')
        .setFooter({ text: 'DG Develops Verification System' });

      const button = new ButtonBuilder()
        .setLabel('Click to Verify')
        .setStyle(ButtonStyle.Link)
        // NO TRAILING SLASH on the domain
        .setURL(`https://verifier-bot.netlify.app/?user=${userId}`);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.user.send({ embeds: [embed], components: [row] });

      // Start polling the Worker /status endpoint
      const workerUrl = 'https://dg-bot.scriptsnsenses.workers.dev';
      const guild = interaction.guild;
      const member = await guild.members.fetch(userId);
      
      let attempts = 0;
      const maxAttempts = 40; // 40 attempts * 3 seconds = 2 minutes timeout

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`${workerUrl}/status?user=${userId}`, {
            headers: { 'x-bot-key': process.env.DISCORD_TOKEN }
          });

          if (res.status === 200) {
            const data = await res.json();
            clearInterval(pollInterval);
            
            if (data.success) {
              // Give role
              const role = guild.roles.cache.get(process.env.VERIFIED_ROLE_ID);
              if (role) {
                await member.roles.add(role);
                await interaction.user.send("✅ You have been successfully verified and given the role!");
              }
            } else {
              // Kick
              await member.kick("Failed Turnstile verification (Bot).");
              await interaction.user.send("❌ You were kicked for failing verification.");
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            await interaction.user.send("⌛ Verification timed out. Please try again.");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Poll every 3 seconds

    } catch (error) {
      console.error('Verify Error:', error);
      await interaction.followUp({ content: "❌ I could not send you a DM. Please make sure your DMs are open.", ephemeral: true });
    }
  }

  // 4. /announce Command
  if (interaction.commandName === 'announce') {
    const targetChannel = interaction.options.getChannel('channel');
    const content = interaction.options.getString('content');
    const mentions = interaction.options.getString('mentions') || '';

    // Check permissions
    if (!targetChannel.permissionsFor(interaction.member).has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({ content: '❌ You do not have permission to send messages in that channel.', ephemeral: true });
    }

    try {
      await targetChannel.send({ content: `${mentions}\n\n${content}` });
      await interaction.reply({ content: `✅ Announcement successfully sent to ${targetChannel}.`, ephemeral: true });
    } catch (error) {
      console.error('Announce Error:', error);
      await interaction.reply({ content: '❌ I could not send the announcement. Check my permissions in that channel.', ephemeral: true });
    }
  }
});

// --- Login ---
client.login(process.env.DISCORD_TOKEN);
