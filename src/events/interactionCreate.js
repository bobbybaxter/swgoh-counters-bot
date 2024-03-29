const _ = require( 'lodash' );
const { stripIndents } = require( 'common-tags' );
const { validateGuild, validatePatreonStatusAndTier } = require( 'src/utils' );

const SINGLEDISCORDTIERS = [ 'Chromium', 'Aurodium' ];

module.exports = ( { log, routes } ) => {
  return {
    name: 'interactionCreate',
    async execute( interaction, client ) {
      let updatedUser;
      const { channel, commandName, options, user } = interaction;
      const command = client.commands.get( interaction.commandName );
      const position = options.get( 'position', false );
      const rangeOption = options.get( 'range', false );
      const powerOption = options.get( 'power', false );
      const range = rangeOption && rangeOption.value || 'no range';
      const power = powerOption && powerOption.value || 'no power';
      const battleTypeOption = options.get( 'battle_type', false );
      const battleType = battleTypeOption && battleTypeOption.value || '5v5';

      const fbUser = await routes.firebase.getUserFromFirebase( user.id );

      if ( !fbUser ) {
        return await interaction.reply( {
          content: stripIndents`If you or your guildmate is an Aurodium-tier Patron, follow the steps below to register your ally code:
        
          Log into [swgohcounters.com](https://swgohcounters.com/account)
          Navigate to the Account Page and enter your ally code
        `, 
          ephemeral: true 
        } );
      }

      updatedUser = await validatePatreonStatusAndTier( log, routes, fbUser );
      const { isCurrentGuildInFirebase, units } = await validateGuild( log, routes, fbUser, updatedUser );

      if ( !_.isEqual( fbUser, updatedUser )) {
        routes.firebase.updateUser( updatedUser );
      }

      updatedUser.tier = 'Aurodium'; // TODO: remove after testing

      if ( !SINGLEDISCORDTIERS.includes( updatedUser.tier ) && !isCurrentGuildInFirebase ) {
        if ( updatedUser.tier === '' ) {
          return await interaction.reply( {
            content: stripIndents`Our records show you're currently not a Patron, or your account is not linked.
              
              If you or your guildmate are an Aurodium-tier Patron, follow the steps below to register your ally code:
    
              Copy your DiscordId: **${ user.id }**
              Log into [swgohcounters.com](https://swgohcounters.com/account)
              Navigate to the Account Page and enter your DiscordId and ally code
            `, 
            ephemeral: true 
          } );
        } else {
          return await interaction.reply( {
            content: stripIndents`Our records show you're a Patron at the ${ fbUser.tier }-tier.

              If your guildmate is an Aurodium-tier Patron, follow the steps below to register your ally code:

              Copy your DiscordId: **${ user.id }**
              Log into [swgohcounters.com](https://swgohcounters.com/account)
              Navigate to the Account Page and enter your DiscordId and ally code

              If not, [consider becoming a Patron](https://www.patreon.com/saiastrange) at the Aurodium-tier to access this bot.
            `, 
            ephemeral: true 
          } );
        }
      }

      if ( commandName === 'search' ) {
        const subcommand = options.getSubcommand();
        if ( subcommand === 'counter' ) {
          const opponent = options.getString( 'opponent' );
          const counter = options.getString( 'counter' );
          log.info( `${ user.tag } in #${ channel.name } searched counter: ${ opponent } vs ${ counter }, ${ range }, ${ battleType }` );
        }
      
        if ( subcommand === 'squad' || subcommand === 'character' ) {
          const type = subcommand === 'squad' ? options.getString( 'squad' ) : options.getString( 'character' );
          log.info( `${ user.tag } in #${ channel.name } searched ${ subcommand }: ${ type } on ${ position.value }, ${ range }, ${ battleType }` );
        }
      }

      if ( commandName === 'counter' ) {
        interaction.units = units;
        if ( !updatedUser.allyCode ) {
          return await interaction.reply( {
            content: stripIndents`To use this command, follow the steps below to register your ally code:

            Copy your DiscordId: **${ user.id }**.
            Paste it into the Account Page of [swgohcounters.com](https://swgohcounters.com/account)
            
            `, 
            ephemeral: true 
          } );
        }

        const opponent = options.getString( 'opponent' );
        log.info( `${ user.tag } in #${ channel.name } searched counter for squad: ${ opponent }, ${ power }, ${ range }, ${ battleType }` );
      }

      if ( commandName === 'help' ) {
        const subcommand = options.getSubcommand();
        if ( subcommand === 'alias' ) {
          const name = options.getString( 'name' );
          log.info( `${ user.tag } in #${ channel.name } searched help ${ subcommand } for ${ name }` );
        }

        if ( subcommand === 'commands' ) {
          log.info( `${ user.tag } in #${ channel.name } searched help commands` );
        }

        return await command.execute( interaction, client.commands );
      }

      if( !interaction.isCommand()) { return; }

      try {
        return await command.execute( interaction );
      } catch( e ) {
        log.error( e );
        return await interaction.reply( { content:"There was an error while executing this command!", ephermeral: true } );
      }
    }
  };
};