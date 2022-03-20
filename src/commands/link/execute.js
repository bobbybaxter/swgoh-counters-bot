const { stripIndents } = require( 'common-tags' );

module.exports = app => async interaction => {
  const { user } = interaction;
      
  return await interaction.reply( {
    content: stripIndents`\u200B\n
      Copy your DiscordId: **${ user.id }**
      Log into [swgohcounters.com](https://swgohcounters.com/account)
      Paste it into the Account Page`, 
    ephemeral: true 
  } );
};