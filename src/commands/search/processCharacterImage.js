const _ = require( 'lodash' );
const { buildCharacterResponse } = require( './utils' );
const { parseCharString } = require( 'src/utils' );

module.exports = async ( {
  app,
  interaction,
  options,
  battleType,
  seasonRangeType,
  seasonNums,
  selectedSeason 
} ) => {
  const { log, routes, toonImgs } = app;
  const characterString = options.getString( 'character' );
  const squadPosition = options.getString( 'position' );
  const uniqueCriteria = squadPosition === 'offense' ? 'opponentSquad[0].id' : 'counterSquad[0].id';
  await interaction.reply( `${ characterString } on ${ squadPosition }` );

  const squad = parseCharString( battleType, characterString );
  if ( !Array.isArray( squad )) {
    return await interaction.reply( `${ characterString } - Character "${ squad }" not found.` );
  }

  try {
    const response = await routes.character.searchCharacter( { battleType, selectedSeason, squadPosition, characterId: squad[ 0 ].id } );

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
    log.error( 'processCharacterImage Error', e );
    return await interaction.editReply( `Error fetching squad - ${ characterString }` );
  }
};