const toons = require( 'src/utils/toons' );

module.exports = roster => {
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
};