const _ = require( 'lodash' );
const { buildSquadResponse } = require( './utils' );
const { parseCharString } = require( 'src/utils' );

module.exports = async ( {
  app,
  interaction,
  options,
  battleType,
  seasonRangeType,
  seasonNums,
  selectedSeason,
} ) => {
  const { log, routes, toonImgs } = app;
  const squadString = options.getString( 'squad' );
  const squadPosition = options.getString( 'position' );
  const uniqueCriteria = squadPosition === 'offense' ? 'opponentSquad[0].id' : 'counterSquad[0].id';
  await interaction.reply( `${ squadString } on ${ squadPosition }` );

  const squad = parseCharString( battleType, squadString );
  if ( !Array.isArray( squad )) {
    return await interaction.editReply( `${ squadString } - Squad character "${ squad }" not found.` );
  }

  try {
    const response = await routes.squad.searchSquad( { battleType, selectedSeason, squadPosition, squad } );
    if ( response.status && response.status !== 200 ) { 
      throw new Error( `${ response.status } - ${ response.statusText }` ); 
    }

    if ( response.length === 0 ) { 
      if ( !seasonRangeType || seasonRangeType === 'three' ) {
        return await interaction.editReply( `No counters for ${ squadString } over the last 3 GAC seasons.  Try a longer range.` ); 
      }
      if ( seasonRangeType === 'all' ) {
        return await interaction.editReply( `No counters for ${ squadString } over all seasons.` ); 
      }
      if ( seasonRangeType === 'last' ) {
        return await interaction.editReply( `No counters for ${ squadString } from last season.  Try a longer range.` ); 
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

    const image = await buildSquadResponse( await toonImgs, battleType, seasonRangeType, seasonNums, squad, squadPosition, uniqueResponse );

    return await interaction.editReply( { files: [ image ] } );
  } catch ( e ) {
    log.error( e );
    return await interaction.editReply( `Error fetching squad - ${ squadString }` );
  }
};