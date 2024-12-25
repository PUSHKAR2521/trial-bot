module.exports = {
  OWNER_IDS: ["705035215642427393"], // Bot owner ID's
  SUPPORT_SERVER: "https://discord.gg/g2xfZFDJZq", // Your bot support server
  PREFIX_COMMANDS: {
    ENABLED: true, // Enable/Disable prefix commands
    DEFAULT_PREFIX: "=", // Default prefix for the bot
  },
  INTERACTIONS: {
    SLASH: true, // Should the interactions be enabled
    CONTEXT: false, // Should contexts be enabled
    GLOBAL: true, // Should the interactions be registered globally
    // TEST_GUILD_ID: "xxxxxxxxxxx", // Guild ID where the interactions should be registered. [** Test you commands here first **]
    TEST_GUILD_ID: "1255882055430963201",
  },
  EMBED_COLORS: {
    BOT_EMBED: "#068ADD",
    TRANSPARENT: "#36393F",
    SUCCESS: "#00A56A",
    ERROR: "#D61A3C",
    WARNING: "#F7E919",
  },
  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 10000,
    MEMBERS: 10000,
  },
  MESSAGES: {
    API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
  },

  // PLUGINS

  AUTOMOD: {
    ENABLED: true,
    LOG_EMBED: "#36393F",
    DM_EMBED: "#36393F",
  },

  DASHBOARD: {
    enabled: false, // enable or disable dashboard
    baseURL: "https://official-bac.onrender.com", // base url
    failureURL: "/404", // failure redirect url
    port: "8888", // port to run the bot on
  },

  ECONOMY: {
    ENABLED: false,
    CURRENCY: "₪",
    DAILY_COINS: 100, // coins to be received by daily command
    MIN_BEG_AMOUNT: 100, // minimum coins to be received when beg command is used
    MAX_BEG_AMOUNT: 2500, // maximum coins to be received when beg command is used
  },

  MUSIC: {
    ENABLED: true,
    IDLE_TIME: 1440, // Time in seconds before the bot disconnects from an idle voice channel
    MAX_SEARCH_RESULTS: 5,
    DEFAULT_SOURCE: "YT", // YT = Youtube, YTM = Youtube Music, SC = SoundCloud
    // Add any number of lavalink nodes here
    // Refer to https://github.com/freyacodes/Lavalink to host your own lavalink server
    LAVALINK_NODES: [
      // {
      //   "host": "0.tcp.in.ngrok.io",
      //   "port": 11580,
      //   "id": "LocalNode from Lenovo",
      //   "password": "youshallnotpass",
      //   "secure": false
      // },
      {
        host: "lava-v3.ajieblogs.eu.org",
        port: 80,
        password: "https://dsc.gg/ajidevserver",
        id: "Ajie Blogs Node V3",
        secure: false,
      },
      // {
      //   host: "127.0.0.1",
      //   port: 5000,
      //   password: "youshallnotpass",
      //   id: "B A C Unauth Lavalink Hosting Unsecured...",
      //   secure: false,
      // },
    ],
  },

  GIVEAWAYS: {
    ENABLED: false,
    REACTION: "🎁",
    START_EMBED: "#FF468A",
    END_EMBED: "#FF468A",
  },

  IMAGE: {
    ENABLED: true,
    BASE_API: "https://strangeapi.hostz.me/api/",
  },

  INVITE: {
    ENABLED: false,
  },

  MODERATION: {
    ENABLED: true,
    EMBED_COLORS: {
      TIMEOUT: "#102027",
      UNTIMEOUT: "#4B636E",
      KICK: "#FF7961",
      SOFTBAN: "#AF4448",
      BAN: "#D32F2F",
      UNBAN: "#00C853",
      VMUTE: "#102027",
      VUNMUTE: "#4B636E",
      DEAFEN: "#102027",
      UNDEAFEN: "#4B636E",
      DISCONNECT: "RANDOM",
      MOVE: "RANDOM",
    },
  },

  PRESENCE: {
    ENABLED: true, // Whether or not the bot should update its status
    STATUS: "online", // The bot's status [online, idle, dnd, invisible]
    TYPE: "WATCHING", // Status type for the bot [PLAYING | LISTENING | WATCHING | COMPETING]
    MESSAGE: "to B A C GAMING", // Your bot status message
  },

  STATS: {
    ENABLED: true,
    XP_COOLDOWN: 15, // Cooldown in seconds between messages
    DEFAULT_LVL_UP_MSG: "{member:tag}, You just advanced to **Level {level}**",
  },

  SUGGESTIONS: {
    ENABLED: true, // Should the suggestion system be enabled
    EMOJI: {
      UP_VOTE: "⬆️",
      DOWN_VOTE: "⬇️",
    },
    DEFAULT_EMBED: "#4F545C",
    APPROVED_EMBED: "#43B581",
    DENIED_EMBED: "#F04747",
  },

  TICKET: {
    ENABLED: true,
    CREATE_EMBED: "#068ADD",
    CLOSE_EMBED: "#068ADD",
  },
};
