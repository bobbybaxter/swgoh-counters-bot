const _ = require( 'lodash' );
const { getSeasonRange, parseCharString } = require( 'src/utils' );
const { addPowerNumsToSquads, buildPlayerCounters, filterBySquadmemberAmount, formatRoster } = require( './utils' );

// TODO: consider adding a "full" option, so that they can receive more than the 25 counters
module.exports = ( { log, routes, toonImgs } ) => async interaction => {
  let avoidCounters, hardCounters, response, softCounters;
  const { options, units } = interaction;
  const squadPosition = 'defense';
  const battleType = options.getString( 'battle_type' ) || '5v5';
  const seasonRangeType = options.getString( 'range' );
  const squadString = options.getString( 'opponent' );
  const squadPowerAbbr = options.getString( 'power' );
  const shouldShowAll = !!options.getString( 'show_all' );
  const seasonNums = getSeasonRange( battleType, seasonRangeType );
  const selectedSeason = seasonNums[ 0 ];
  const squadPower = squadPowerAbbr ? ( squadPowerAbbr <= 100000 ? squadPowerAbbr * 1000 : parseInt( squadPowerAbbr, 10 )) : undefined;

  const squad = parseCharString( battleType, squadString );
  if ( !Array.isArray( squad )) {
    if ( squad.charAt( 0 ) === "!" ) {
      return await interaction.reply( `Squad "${ squad }" not found.` );
    } else {
      return await interaction.reply( `${ squadString } - Squad character "${ squad }" not found.` );
    }
  }

  try {
    response = await routes.squad.searchSquad( { battleType, selectedSeason, squadPosition, squad } );
    if ( response.status && response.status !== 200 ) { 
      throw new Error( `${ response.status } - ${ response.statusText }` ); 
    }

    if ( response.length === 0 ) { 
      if ( !seasonRangeType || seasonRangeType === 'three' ) {
        return await interaction.reply( `No counters for ${ squadString } over the last 3 GAC seasons.  Try a longer range.` ); 
      }
      if ( seasonRangeType === 'all' ) {
        return await interaction.reply( `No counters for ${ squadString } over all seasons.` ); 
      }
      if ( seasonRangeType === 'last' ) {
        return await interaction.reply( `No counters for ${ squadString } from last season.  Try a longer range.` ); 
      }
    }

    const powerInfo = squadPower ? ` at ${ squadPower.toLocaleString() } power` : '';
    await interaction.reply( `counters against ${ squadString }${ powerInfo }` );

    const roster = formatRoster( units );
    response = addPowerNumsToSquads( response, roster );

    const orderByColumns = [ 'avgWin', 'totalSeen', 'avgBanners' ];
    const orderByOrders = [ 'desc', 'desc', 'desc' ];
    const availableSquads = response.filter( x => x.counterPower > 0 );
    hardCounters = _.orderBy( availableSquads.filter( x => x.avgWin >= .90 ), orderByColumns, orderByOrders );
    softCounters = _.orderBy( availableSquads.filter( x => x.avgWin >= .75 && x.avgWin < .90 ), orderByColumns, orderByOrders );
    avoidCounters = _.orderBy( availableSquads.filter( x => x.avgWin < .75 ), orderByColumns, orderByOrders );
    
    if ( squadPower ) {
      hardCounters = hardCounters.filter( x => filterBySquadmemberAmount( x, squadPower ));
      softCounters = softCounters.filter( x => filterBySquadmemberAmount( x, squadPower ));
    }

    const filteredResponse = [];
    filteredResponse.push( ...hardCounters );
    filteredResponse.push( ...softCounters );
    filteredResponse.push( ...avoidCounters );

    const image = await buildPlayerCounters( {
      toonImgs: await toonImgs,
      battleType,
      seasonRangeType,
      seasonNums,
      shouldShowAll,
      squad,
      squadPosition,
      squadPower,
      counters: filteredResponse
    } );

    return await interaction.editReply( { files: [ image ] } );
  } catch ( e ) {
    log.error( e );
    return await interaction.editReply( `Error fetching counter for ${ squadString }` );
  }
};