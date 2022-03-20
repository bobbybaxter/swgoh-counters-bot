const { stripIndents } = require( 'common-tags' );

module.exports = app => async interaction => {
  const { user } = interaction;
      
  return await interaction.reply( {
    content: stripIndents`\u200B\n
      Copy your DiscordId: **${ user.id }**.
      Paste it into the Account Page of [swgohcounters.com](https://swgohcounters.com/account)`, 
    ephemeral: true 
  } );
};