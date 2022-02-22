const fetch = require( 'node-fetch' );

const baseUrl = process.env.SEARCH_API_URL;

module.exports = {
  async searchCounter( data ) {
    const response = await fetch( `${ baseUrl }/counter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DiscordToken ${ process.env.TOKEN }`
      },
      body: JSON.stringify( data ),
    } );
    return await response.json();
  }
};