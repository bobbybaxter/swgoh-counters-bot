const _ = require( 'lodash' );
const toons = require( 'src/utils/toons' );
const { getSeasonRange, parseCharString } = require( 'src/utils' );
const { searchSquad } = require( 'src/api/squadData' );
const { getPlayerData } = require( 'src/api/playerData' );
const { buildPlayerCounters } = require( './utils' );

function formatRoster( roster ) {
  const newRoster = [];
  for ( let i = 0; i < toons.length; i += 1 ) {
    const matchedCharacter = roster.filter( ownedChar => ownedChar.id === toons[ i ].id )[ 0 ];
    if ( matchedCharacter ) {
      newRoster.push( matchedCharacter );
    } else {
      newRoster.push( {
        id: toons[ i ].id,
        name: toons[ i ].name,
        power: 0
      } );
    }
  }
  return newRoster;
}

function addPowerNumsToSquads( response, roster ) {
  const mappedResponse = response.map( counter => {
    let counterPower = 0;
    let squadmembers = 0;

    counter.counterSquad.forEach( char => {
      const matchedCharacter = roster.filter( ownedChar => ownedChar.id === char.id )[ 0 ];

      if ( char.id === 'BLANK' ) {
        return counterPower += 0;
      }

      if ( matchedCharacter.power > 0 ) { 
        squadmembers += 1;
        counterPower += matchedCharacter.power;
      } else {
        counterPower = -100000000;
      }
    } );
    
    return {
      ...counter,
      counterPower,
      squadmembers,
    };
  } );

  return mappedResponse;
}

function filterBySquadmemberAmount( x, squadPower ) {
  switch( x.squadmembers ) {
  case 5: return x.counterPower >= ( squadPower - ( squadPower * .05 ));
  case 4: return x.counterPower >= ( squadPower - ( squadPower * .10 ));
  case 3: return x.counterPower >= ( squadPower - ( squadPower * .15 ));
  case 2: return x.counterPower >= ( squadPower - ( squadPower * .20 ));
  case 1: return x.counterPower >= ( squadPower - ( squadPower * .25 ));
  default: return x;
  }
}

// TODO: consider adding a "full" option, so that they can receive more than the 25 counters
module.exports = app => async interaction => {
  let avoidCounters, hardCounters, response, softCounters;
  const { toonImgs } = app;
  const firebaseData = require( 'src/api/firebaseData' )( app );
  const { options, user } = interaction;
  const squadPosition = 'defense';
  const battleType = options.getString( 'battle_type' ) || '5v5';
  const seasonRangeType = options.getString( 'range' );
  const squadString = options.getString( 'opponent' );
  const squadPowerAbbr = options.getString( 'power' );
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
    response = await searchSquad( { battleType, selectedSeason, squadPosition, squad } );
    if ( response.status && response.status !== 200 ) { 
      throw new Error( `${ response.status } - ${ response.statusText }` ); 
    }

    if ( response.length === 0 ) { 
      if ( !seasonRangeType || seasonRangeType === 'three' ) {
        return await interaction.reply( `No counters for ${ squadString } over the last 3 GAC seasons` ); 
      }
      if ( seasonRangeType === 'all' ) {
        return await interaction.reply( `No counters for ${ squadString } over all seasons` ); 
      }
      if ( seasonRangeType === 'last' ) {
        return await interaction.reply( `No counters for ${ squadString } from last season` ); 
      }
    }

    const powerInfo = squadPower ? ` at ${ squadPower.toLocaleString() } power` : '';
    await interaction.reply( `counters against ${ squadString }${ powerInfo }` );

    const fbUser = await firebaseData( user.id );
    const shouldSortByRoster = fbUser && fbUser.allyCode ? true : false;
    if ( shouldSortByRoster ) {
      const unformattedRoster = await getPlayerData( fbUser.allyCode );
      const roster = formatRoster( unformattedRoster );
      response = addPowerNumsToSquads( response, roster );
    } else {
      return await interaction.editReply( `To use this command, follow the steps below to register your allycode:
      \u200B\n
      Copy your DiscordId: **${ user.id }**.
      Paste it into the Account Page of [swgohcounters.com](https://swgohcounters.com/account)`, 
      { emphemeral: true } );
    }

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
      squad,
      squadPosition,
      squadPower,
      counters: filteredResponse
    } );
    
    return await interaction.editReply( { files: [ image ] } );
  } catch ( e ) {
    console.error( 'fetch error', e );
    return await interaction.editReply( `Error fetching squad - ${ squad }` );
  }
};