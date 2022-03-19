const { SlashCommandBuilder } = require( '@discordjs/builders' );

module.exports = app => new SlashCommandBuilder()
  .setName( 'counter' )
  .setDescription( 'Search counters based on two given squads' )
  .addStringOption( option => 
    option.setName( 'opponent' )
      .setDescription( 'List at least one toon. To add more, separate with slashes. ex: traya/sion/nihilus' )
      .setRequired( true ))
  .addStringOption( option => 
    option.setName( 'power' )
      .setDescription( 'Give squad power level (in thousands). ex: 96 (to search 96,000)' ))
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
      .addChoice( '3v3', "3v3" ));