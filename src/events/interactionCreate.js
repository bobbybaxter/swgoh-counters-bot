const { stripIndents } = require( 'common-tags' );
const { validateGuild, validatePatreonStatusAndTier } = require( 'src/utils' );

module.exports = ( { log, routes } ) => {
  return {
    name: 'interactionCreate',
    async execute( interaction, client ) {
      let isRestricted = false;
      let isCurrentGuildInFirebase = false;
      let isNowGuildTier = false;
      let updatedUser;
      const { channel, commandName, options, user } = interaction;
      const position = options.get( 'position', false );
      const rangeOption = options.get( 'range', false );
      const powerOption = options.get( 'power', false );
      const range = rangeOption && rangeOption.value || 'no range';
      const power = powerOption && powerOption.value || 'no power';
      const battleTypeOption = options.get( 'battle_type', false );
      const battleType = battleTypeOption && battleTypeOption.value || '5v5';

      const fbUser = await routes.firebase.getUserFromFirebase( user.id );
      updatedUser = await validatePatreonStatusAndTier( log, routes, fbUser );
      const guildValidationResponse = await validateGuild( log, routes, updatedUser );
      const { guildData, units } = guildValidationResponse;
      ( { updatedUser } = guildValidationResponse );

      if ( fbUser !== updatedUser ) {
        routes.firebase.updateUser( updatedUser );
      }
      guildData && ( { isCurrentGuildInFirebase, isNowGuildTier } = guildData );

      // TODO: test all of these scenarios out
      fbUser.tier = '';
      isCurrentGuildInFirebase = false;

      if ( !fbUser ) { isRestricted = true; }
      // console.log( 'isRestricted :>> ', isRestricted );
      if ( fbUser && fbUser.patronStatus === 'active_patron' || fbUser && fbUser.patronStatus === 'Active Patron' ) { isRestricted = true; }
      // console.log( 'isRestricted :>> ', isRestricted );
      if ( isCurrentGuildInFirebase || isNowGuildTier ) { isRestricted = false; }
      // console.log( 'isRestricted :>> ', isRestricted );


      if ( isRestricted ) {
        if ( !fbUser ) {
          return await interaction.reply( stripIndents`If you or your guildmate is an Aurodium-tier Patron, follow the steps below to register your ally code:
          
            Copy your DiscordId: **${ user.id }**.
            Paste it into the Account Page of [swgohcounters.com](https://swgohcounters.com/account) and make sure your ally code is also there!
          `, 
          { emphemeral: true } );
        }

        if ( fbUser.tier !== 'Aurodium'  ) {
          if ( fbUser.tier === '' ) {
            return await interaction.reply( stripIndents`Our records show you're currently not a Patron, or your account is not linked.
              
              If you or your guildmate are an Aurodium-tier Patron, follow the steps below to register your ally code:
    
              Copy your DiscordId: **${ user.id }**.
              Paste it into the Account Page of [swgohcounters.com](https://swgohcounters.com/account) and make sure your ally code is also there!
            `, 
            { emphemeral: true } );
          } else {
            return await interaction.reply( stripIndents`Our records show you're a Patron at the ${ fbUser.tier }-tier.

              If your guildmate is an Aurodium-tier Patron, follow the steps below to register your ally code:

              Copy your DiscordId: **${ user.id }**.
              Paste it into the Account Page of [swgohcounters.com](https://swgohcounters.com/account) and make sure your ally code is also there!

              If not, [consider becoming a Patron](https://www.patreon.com/saiastrange) at the Aurodium-tier to access this bot.
            `, 
            { emphemeral: true } );
          }
        }
      }

      interaction.fbUser = fbUser || {};
      interaction.units = units || [];

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
        const opponent = options.getString( 'opponent' );
        log.info( `${ user.tag } in #${ channel.name } searched counter for squad: ${ opponent }, ${ power }, ${ range }, ${ battleType }` );
      }

      if( !interaction.isCommand()) { return; }

      const command = client.commands.get( interaction.commandName );

      try {
        await command.execute( interaction );
      } catch( e ) {
        log.error( "interactionCreate Error", e );
        await interaction.reply( { content:"There was an error while executing this command!", ephermeral: true } );
      }
    }
  };
};