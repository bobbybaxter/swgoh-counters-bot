const fetch = require( 'node-fetch' );

module.exports = app => async allyCode => {
  const response = await fetch( `https://api.allorigins.win/get?url=${ encodeURIComponent( `https://swgoh.gg/api/player/${ allyCode }` ) }` );

  if ( response.status === 404 ) {
    throw new Error( 'User does not exist.' );
  }
  const jsonResponse = await response.json();
  const contents = JSON.parse( jsonResponse.contents );

  return await contents;
};
