const { Client, Collection, Intents } = require( "discord.js" );
const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v9' );
const commandsFactory = require( './commands' );
const eventsFactory = require( './events' );

const rest = new REST( { version: '9' } ).setToken( process.env.TOKEN );

function setComponent( client, clientType, component ) {
  if ( clientType === 'events' ) {
    component.forEach( event => {
      if ( event.once ) {
        client.once( event.name, ( ...args ) => event.execute( ...args ));
      } else {
        client.on( event.name, ( ...args ) => event.execute( ...args, client ));
      }
    } );
  } else {
    component.forEach( item => {
      client[ clientType ].set( item.data.name, item );
    } );
  }
}

module.exports = async app => {
  const commands = await commandsFactory( app );
  const events = await eventsFactory( app );
  const intents = new Intents();
  intents.add(
    'GUILDS',
    'GUILD_MESSAGES'
  );

  const client = new Client( { intents } );
  client.commands = new Collection();

  setComponent( client, 'commands', commands );
  setComponent( client, 'events', events );

  const commandsData = commands.map( x => x.data );

  try {
    rest.put( Routes.applicationCommands( process.env.CLIENT_ID ), { body: commandsData } );
    app.log.info( 'Successfully registered application commands.' );
  } catch ( e ) {
    app.log.error( e );
  }

  client.login( process.env.TOKEN );

  return client;
};