const { SlashCommandBuilder } = require( '@discordjs/builders' );

module.exports = app => new SlashCommandBuilder()
  .setName( 'ping' )
  .setDescription( 'Returns ping speed of API' );