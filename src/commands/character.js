const _ = require( 'lodash' );
const { SlashCommandBuilder } = require( '@discordjs/builders' );
const buildCharacterResponse = require( 'src/utils/buildCharacterResponse' );
const getSeasonRange = require( 'src/utils/getSeasonRange' );
const parseCharString = require( 'src/utils/parseCharString' );
const { searchCharacter } = require( 'src/api/characterData' );

module.exports = ( { toonImgs } ) => {
  return {
    data: new SlashCommandBuilder()
      .setName( 'character' )
      .setDescription( 'Returns counters for a given character' )
      .addSubcommand( subcommand =>
        subcommand.setName( '5v5' )
          .setDescription( '5v5 counter info for a character' )
          .addStringOption( option => 
            option.setName( 'character' )
              .setDescription( 'List one toon. ex: gas' )
              .setRequired( true )
          )
          .addStringOption( option => 
            option.setName( 'position' )
              .setDescription( 'Offense or Defense' )
              .addChoice( 'Offense', 'offense' )
              .addChoice( 'Defense', 'defense' )
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
          .setDescription( '3v3 counter info for a character' )
          .addStringOption( option => 
            option.setName( 'character' )
              .setDescription( 'List one toon. ex: gas' )
              .setRequired( true )
          )
          .addStringOption( option => 
            option.setName( 'position' )
              .setDescription( 'Offense or Defense' )
              .addChoice( 'Offense', 'offense' )
              .addChoice( 'Defense', 'defense' )
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
      const characterString = options.getString( 'character' );
      const squadPosition = options.getString( 'position' );
      const uniqueCriteria = squadPosition === 'offense' ? 'opponentSquad[0].id' : 'counterSquad[0].id';

      const squad = parseCharString( battleType, characterString );
      if ( !Array.isArray( squad )) {
        return await interaction.reply( `${ characterString } - Character "${ squad }" not found.` );
      }

      try {
        const response = await searchCharacter( { battleType, selectedSeason, squadPosition, characterId: squad[ 0 ].id } );

        if ( response.status && response.status !== 200 ) { 
          throw new Error( `${ response.status } - ${ response.statusText }` ); 
        }

        if ( response.length === 0 ) { 
          if ( !seasonRangeType || seasonRangeType === 'three' ) {
            return await interaction.reply( `No counters for ${ characterString } over the last 3 GAC seasons` ); 
          }

          if ( seasonRangeType === 'all' ) {
            return await interaction.reply( `No counters for ${ characterString } over all seasons` ); 
          }

          if ( seasonRangeType === 'last' ) {
            return await interaction.reply( `No counters for ${ characterString } from last season` ); 
          }
        }

        await interaction.reply( `${ characterString } on ${ squadPosition }` );

        const hardCounters = response.filter( x => x.avgWin >= .90 ).sort(( a,b ) => a.avgWin > b.avgWin ? -1 : 1 );
        const softCounters = response.filter( x => x.avgWin >= .75 && x.avgWin < .90 ).sort(( a,b ) => a.avgWin > b.avgWin ? -1 : 1 );
        const avoidCounters = response.filter( x => x.avgWin < .75 ).sort(( a,b ) => a.avgWin > b.avgWin ? -1 : 1 );
        const filteredResponse = [];
        filteredResponse.push( ...hardCounters );
        filteredResponse.push( ...softCounters );
        filteredResponse.push( ...avoidCounters );
        const uniqueResponse = _.uniqBy( filteredResponse, uniqueCriteria );

        const image = await buildCharacterResponse( await toonImgs, battleType, seasonRangeType, seasonNums, squad, squadPosition, uniqueResponse );
        
        return await interaction.editReply( { files: [ image ] } );
      } catch ( e ) {
        console.error( 'fetch error', e );
        return await interaction.editReply( `Error fetching squad - ${ squad }` );
      }
    },
  };
};