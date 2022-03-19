const fetch = require( 'node-fetch' );

module.exports = ( { log } ) => async allyCode => {
  const url = `https://api.allorigins.win/get?url=${ encodeURIComponent( `https://swgoh.gg/api/player/${ allyCode }` ) }`;
  try {
    const response = await fetch( `${ url }` );

    if ( response.status === 404 ) {
      throw new Error( 'User does not exist.' );
    }

    const jsonResponse = await response.json();
    const contents = JSON.parse( jsonResponse.contents );
    return contents.units
      .filter( x => x.data.combat_type !== 2 )
      .flatMap( x => {
        return {
          id: x.data.base_id,
          name: x.data.name,
          power: x.data.power
        };
      } );
  } catch ( err ) {
    log.error( 'Error fetching Player Data', err );
    throw err;
  }
};
