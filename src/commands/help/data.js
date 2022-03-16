const { SlashCommandBuilder } = require( '@discordjs/builders' );

// TODO: add a string option for a single character search
module.exports = app => new SlashCommandBuilder()
  .setName( 'help' )
  .setDescription( 'Help menu' )
  .addSubcommand( subcommand =>
    subcommand.setName( 'alias' )
      .setDescription( 'Get a list of character abbreviations' )
  );