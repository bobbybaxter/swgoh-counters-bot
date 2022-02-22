const { SlashCommandBuilder } = require( '@discordjs/builders' );
const parseCharString = require( 'src/utils/parseCharString' );
const buildImage = require( 'src/utils/buildImage' );
const { searchCounter } = require( 'src/api/counterData' );

const SeasonNums5v5 = [ 10, 11, 13, 15, 17, 19, 21, 23 ];
const SeasonNums3v3 = [ 9, 12, 14, 16, 18, 20, 22 ];

function getSeasonRange( battleType, range ) {
  const last5v5 = SeasonNums5v5[ SeasonNums5v5.length - 1 ];
  const last3v3 = SeasonNums3v3[ SeasonNums3v3.length - 1 ];

  if ( !range || range === 'three' ) {
    if ( battleType === '5v5' ) {
      return [ SeasonNums5v5[ SeasonNums5v5.length - 3 ], last5v5 ];
    }

    return [ SeasonNums3v3[ SeasonNums3v3.length - 3 ], last3v3 ];
  }

  if ( range === 'last' ) {
    if ( battleType === '5v5' ) {
      return [ last5v5, last5v5 ];
    }
    
    return [ last3v3, last3v3 ];
  }

  if ( range === 'all' ) { 
    if ( battleType === '5v5' ) {
      return [ SeasonNums5v5[ 0 ], last5v5 ];
    }
    
    return [ SeasonNums3v3[ 0 ], last3v3 ];
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName( 'counter' )
    .setDescription( 'Returns info from given counter' )
    .addSubcommand( subcommand =>
      subcommand.setName( '5v5' )
        .setDescription( '5v5 counter info between two squads' )
        .addStringOption( option => 
          option.setName( 'opponent_squad' )
            .setDescription( 'List at least one toon. To add more, separate with slashes. ex: traya/sion/nihilus' )
            .setRequired( true )
        )
        .addStringOption( option => 
          option.setName( 'counter_squad' )
            .setDescription( 'List at least one toon. To add more, separate with slashes. ex: traya/sion/nihilus' )
            .setRequired( true )
        )
        .addStringOption( option =>
          option.setName( 'range' )
            .setDescription( 'Search all seasons, the last season, or the last three seasons (default).' )
            .addChoice( 'All', "all" )
            .addChoice( 'Last Season', "last" )
            .addChoice( 'Last 3 Seasons', "three" )
        )
    )
    .addSubcommand( subcommand =>
      subcommand.setName( '3v3' )
        .setDescription( '3v3 counter info between two squads' )
        .addStringOption( option => 
          option.setName( 'opponent_squad' )
            .setDescription( 'List at least one toon. To add more, separate with slashes. ex: traya/sion/nihilus' )
            .setRequired( true )
        )
        .addStringOption( option => 
          option.setName( 'counter_squad' )
            .setDescription( 'List at least one toon. To add more, separate with slashes. ex: traya/sion/nihilus' )
            .setRequired( true )
        )
        .addStringOption( option =>
          option.setName( 'range' )
            .setDescription( 'Search all seasons, the last season, or the last three seasons (default).' )
            .addChoice( 'All', "all" )
            .addChoice( 'Last Season', "last" )
            .addChoice( 'Last 3 Seasons', "three" )
        )
    ),
  async execute( interaction ) {
    const { options } = interaction;
    const battleType = options.getSubcommand();
    const seasonRangeType = options.getString( 'range' );
    const seasonNums = getSeasonRange( battleType, seasonRangeType );
    const selectedSeason = seasonNums[ 0 ];
    const opponentSquadString = options.getString( 'opponent_squad' );
    const counterSquadString = options.getString( 'counter_squad' );

    const opponentSquad = parseCharString( battleType, opponentSquadString );
    if ( !Array.isArray( opponentSquad )) {
      return await interaction.reply( `${ opponentSquadString } vs ${ counterSquadString }.  Opponent Squad character "${ opponentSquad }" not found.` );
    }

    const counterSquad = parseCharString( battleType, counterSquadString );
    if ( !Array.isArray( counterSquad )) {
      return await interaction.reply( `${ opponentSquadString } vs ${ counterSquadString }.  Counter Squad character "${ counterSquad }" not found.` );
    }

    try {
      const response = await searchCounter( { battleType, selectedSeason, opponentSquad, counterSquad } );

      if ( response.status && response.status !== 200 ) { 
        throw new Error( `${ response.status } - ${ response.statusText }` ); 
      }

      if ( response.length === 0 ) { 
        if ( !seasonRangeType || seasonRangeType === 'three' ) {
          return await interaction.reply( `No counters for ${ opponentSquadString } vs ${ counterSquadString } over the last 3 GAC seasons` ); 
        }

        if ( seasonRangeType === 'all' ) {
          return await interaction.reply( `No counters for ${ opponentSquadString } vs ${ counterSquadString } over all seasons` ); 
        }

        if ( seasonRangeType === 'last' ) {
          return await interaction.reply( `No counters for ${ opponentSquadString } vs ${ counterSquadString } from last season` ); 
        }
      }

      await interaction.reply( `${ opponentSquadString } vs ${ counterSquadString }` );

      const hardCounters = response.filter( x => x.avgWin >= .90 ).sort(( a,b ) => a.avgWin > b.avgWin ? -1 : 1 );
      const softCounters = response.filter( x => x.avgWin >= .75 && x.avgWin < .90 ).sort(( a,b ) => a.avgWin > b.avgWin ? -1 : 1 );
      const avoidCounters = response.filter( x => x.avgWin < .75 ).sort(( a,b ) => a.avgWin > b.avgWin ? -1 : 1 );
      const filteredResponse = [];
      filteredResponse.push( ...hardCounters );
      filteredResponse.push( ...softCounters );
      filteredResponse.push( ...avoidCounters );
      const image = await buildImage( battleType, seasonRangeType, seasonNums, opponentSquad, counterSquad, filteredResponse );

      return await interaction.editReply( { files: [ image ] } );
    } catch ( e ) {
      console.error( 'fetch error', e );
      return await interaction.editReply( `Error fetching counter` );
    }
  },
};