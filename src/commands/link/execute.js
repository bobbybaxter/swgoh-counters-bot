module.exports = app => async interaction => {
  const { user } = interaction;
      
  return await interaction.reply( `\u200B\n
  Copy your DiscordId: **${ user.id }**.
  Paste it into the Account Page of [swgohcounters.com](https://swgohcounters.com/account)`, 
  { ephemeral: true } );
};