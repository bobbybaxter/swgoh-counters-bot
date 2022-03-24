const { SlashCommandBuilder } = require( '@discordjs/builders' );

module.exports = app => new SlashCommandBuilder()
  .setName( 'search' )
  .setDescription( 'Returns counters for the given character(s) or squad(s)' )
  .addSubcommand( subcommand =>
    subcommand.setName( 'counter' )
      .setDescription( 'Search counters based on two given squads' )
      .addStringOption( option => 
        option.setName( 'opponent' )
          .setDescription( 'List at least one toon. To add more, separate with slashes. ex: traya/sion/nihilus' )
          .setRequired( true ))
      .addStringOption( option => 
        option.setName( 'counter' )
          .setDescription( 'List at least one toon. To add more, separate with slashes. ex: traya/sion/nihilus' )
          .setRequired( true ))
      .addStringOption( option =>
        option.setName( 'range' )
          .setDescription( 'Search all seasons, the last season, or the last three seasons (default).' )
          .addChoice( 'All', "all" )
          .addChoice( 'Last Season', "last" )
          .addChoice( 'Last 3 Seasons', "three" ))
      .addStringOption( option =>
        option.setName( 'battle_type' )
          .setDescription( '5v5 or 3v3' )
          .addChoice( '5v5', "5v5" )
          .addChoice( '3v3', "3v3" ))
  )
  .addSubcommand( subcommand =>
    subcommand.setName( 'squad' )
      .setDescription( 'Search offensive or defensive counters for one squad' )
      .addStringOption( option => 
        option.setName( 'squad' )
          .setDescription( 'List at least one toon. To add more, separate with slashes. ex: traya/sion/nihilus' )
          .setRequired( true ))
      .addStringOption( option => 
        option.setName( 'position' )
          .setDescription( 'Offense or Defense' )
          .addChoice( 'Offense', 'offense' )
          .addChoice( 'Defense', 'defense' )
          .setRequired( true ))
      .addStringOption( option =>
        option.setName( 'range' )
          .setDescription( 'Search all seasons, the last season, or the last three seasons (default).' )
          .addChoice( 'All', "all" )
          .addChoice( 'Last Season', "last" )
          .addChoice( 'Last 3 Seasons', "three" ))
      .addStringOption( option =>
        option.setName( 'battle_type' )
          .setDescription( '5v5 or 3v3' )
          .addChoice( '5v5', "5v5" )
          .addChoice( '3v3', "3v3" )
      )
  ).addSubcommand( subcommand =>
    subcommand.setName( 'character' )
      .setDescription( 'Search offensive or defensive counters for one character' )
      .addStringOption( option => 
        option.setName( 'character' )
          .setDescription( 'List one toon. ex: gas' )
          .setRequired( true ))
      .addStringOption( option => 
        option.setName( 'position' )
          .setDescription( 'Offense or Defense' )
          .addChoice( 'Offense', 'offense' )
          .addChoice( 'Defense', 'defense' )
          .setRequired( true ))
      .addStringOption( option =>
        option.setName( 'range' )
          .setDescription( 'Search all seasons, the last season, or the last three seasons (default).' )
          .addChoice( 'All', "all" )
          .addChoice( 'Last Season', "last" )
          .addChoice( 'Last 3 Seasons', "three" ))
      .addStringOption( option =>
        option.setName( 'battle_type' )
          .setDescription( '5v5 or 3v3' )
          .addChoice( '5v5', "5v5" )
          .addChoice( '3v3', "3v3" )
      )
  );