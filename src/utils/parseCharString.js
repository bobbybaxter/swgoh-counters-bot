const aliases = require( './toons' );
const squadTemplates = require( './squadTemplates' );

module.exports = ( battleType, squadString ) => {
  const fullSquad = [];
  const blankToon = { id: 'BLANK', name: 'Blank' };

  if ( squadString.charAt( 0 ) === "!" ) {
    const squadAlias = squadString.slice( 1 );
    const squadTemplate = squadTemplates.find( x => x.alias.map( x => x.toLowerCase()).includes( squadAlias.toLowerCase()));
    if ( squadTemplate ) {
      fullSquad.push( ...squadTemplate.squad );
    } else {
      return squadString;
    }
  } else {
    const abbrSquad = squadString.split( "/" );
    const requestedSquadLength = abbrSquad.length;
    const neededSquadLength = parseInt( battleType.charAt( 0 ), 10 );

    for ( let i = 0; i < requestedSquadLength; i += 1 ) {
      const toon = aliases.find( x => x.alias.map( x => x.toLowerCase()).includes( abbrSquad[ i ].toLowerCase()));
      if ( !toon ) {
        return abbrSquad[ i ];
      } else {
        fullSquad.push( {
          id: toon.id,
          name: toon.name
        } );
      }
    }

    if ( requestedSquadLength < neededSquadLength ) {
      const blankSquadsNeeded = neededSquadLength - requestedSquadLength;
      for ( let i = 0; i < blankSquadsNeeded; i += 1 ) {
        fullSquad.push( blankToon );
      }
    }
  }

  return fullSquad; 
};