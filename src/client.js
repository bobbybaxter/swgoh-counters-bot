const { Client, Collection, Intents } = require( "discord.js" );
const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v9' );

const commands = require( './commands' )();
const events = require( './events' )();

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

module.exports = () => {
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
    rest.put( Routes.applicationGuildCommands( process.env.CLIENT_ID, process.env.GUILD_ID ), { body: commandsData } );
    console.info( 'Successfully registered application commands.' );
  } catch ( e ) {
    console.error( 'Application commands failed to register.', e );
  }

  return client;
};