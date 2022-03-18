const fetch = require( 'node-fetch' );

const baseUrl = process.env.DISCORDBOT_API_URL;

module.exports = async data => {
  const response = await fetch( `${ baseUrl }/character`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `DiscordToken ${ process.env.TOKEN }`
    },
    body: JSON.stringify( data ),
  } );
  return await response.json();
};