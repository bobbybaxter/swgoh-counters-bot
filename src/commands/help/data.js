const { SlashCommandBuilder } = require( '@discordjs/builders' );

module.exports = app => new SlashCommandBuilder()
  .setName( 'help' )
  .setDescription( 'Help menu' )
  .addSubcommand( subcommand =>
    subcommand.setName( 'alias' )
      .setDescription( 'Search for character or squad abbreviations' )
      .addStringOption( option => 
        option.setName( 'name' )
          .setDescription( 'Name or abbreviation you want to search.' )
          .setRequired( true )
      )
  )
  .addSubcommand( subcommand =>
    subcommand.setName( 'commands' )
      .setDescription( 'Returns a list of available commands' )
  )
  .addSubcommand( subcommand =>
    subcommand.setName( 'tips' )
      .setDescription( 'Returns some search tips' )
  );