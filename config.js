module.exports = {
  prefix: '!', // Fallback prefix
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID, // Optional: for registering guild-specific commands
  colors: {
    primary: '#0099ff',
    success: '#00ff00',
    error: '#ff0000',
    warning: '#ffff00'
  },
  roles: {
    support: process.env.SUPPORT_ROLE_ID,
    admin: process.env.ADMIN_ROLE_ID
  },
  channels: {
    ticketCategory: process.env.TICKET_CATEGORY_ID,
    modLogs: process.env.MOD_LOGS_ID
  }
};
