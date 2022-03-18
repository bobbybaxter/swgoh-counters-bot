module.exports = ( response, roster ) => {
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
};