const { buildCounterResponse } = require( './utils' );
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
  const opponentSquadString = options.getString( 'opponent' );
  const counterSquadString = options.getString( 'counter' );
  await interaction.reply( `${ opponentSquadString } vs ${ counterSquadString }` );

  const opponentSquad = parseCharString( battleType, opponentSquadString );
  if ( !Array.isArray( opponentSquad )) {
    return await interaction.reply( `${ opponentSquadString } vs ${ counterSquadString }.  Opponent Squad character "${ opponentSquad }" not found.` );
  }

  const counterSquad = parseCharString( battleType, counterSquadString );
  if ( !Array.isArray( counterSquad )) {
    return await interaction.reply( `${ opponentSquadString } vs ${ counterSquadString }.  Counter Squad character "${ counterSquad }" not found.` );
  }

  try {
    const response = await routes.counter.searchCounter( { battleType, selectedSeason, opponentSquad, counterSquad } );

    if ( response.status && response.status !== 200 ) { 
      throw new Error( `${ response.status } - ${ response.statusText }` ); 
    }

    if ( response.length === 0 ) { 
      if ( !seasonRangeType || seasonRangeType === 'three' ) {
        return await interaction.reply( `No counters for ${ opponentSquadString } vs ${ counterSquadString } over the last 3 GAC seasons.  Try a longer range.` ); 
      }

      if ( seasonRangeType === 'all' ) {
        return await interaction.reply( `No counters for ${ opponentSquadString } vs ${ counterSquadString } over all seasons.` ); 
      }

      if ( seasonRangeType === 'last' ) {
        return await interaction.reply( `No counters for ${ opponentSquadString } vs ${ counterSquadString } from last season.  Try a longer range.` ); 
      }
    }

    const hardCounters = response.filter( x => x.avgWin >= .90 ).sort(( a,b ) => a.avgWin > b.avgWin ? -1 : 1 );
    const softCounters = response.filter( x => x.avgWin >= .75 && x.avgWin < .90 ).sort(( a,b ) => a.avgWin > b.avgWin ? -1 : 1 );
    const avoidCounters = response.filter( x => x.avgWin < .75 ).sort(( a,b ) => a.avgWin > b.avgWin ? -1 : 1 );
    const filteredResponse = [];
    filteredResponse.push( ...hardCounters );
    filteredResponse.push( ...softCounters );
    filteredResponse.push( ...avoidCounters );

    const image = await buildCounterResponse( await toonImgs, battleType, seasonRangeType, seasonNums, opponentSquad, counterSquad, filteredResponse );
    
    return await interaction.editReply( { files: [ image ] } );
  } catch ( e ) {
    log.error( 'processCounterImage Error', e );
    return await interaction.editReply( `Error fetching counter = ${ opponentSquadString } vs ${ counterSquadString }` );
  }
};