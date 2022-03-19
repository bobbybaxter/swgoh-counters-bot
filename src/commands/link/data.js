const { SlashCommandBuilder } = require( '@discordjs/builders' );

module.exports = app => new SlashCommandBuilder()
  .setName( 'link-account' )
  .setDescription( 'Links your Discord to swgohcounters.com.' );