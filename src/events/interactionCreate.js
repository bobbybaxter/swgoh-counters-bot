
module.exports = {
  name: 'interactionCreate',
  async execute( interaction, client ) {
    const { channel, commandName, options, user } = interaction;
    const position = options.get( 'position', false );
    const rangeOption = options.get( 'range', false );
    const powerOption = options.get( 'power', false );
    const range = rangeOption && rangeOption.value || 'no range';
    const power = powerOption && powerOption.value || 'no power';
    const battleTypeOption = options.get( 'battle_type', false );
    const battleType = battleTypeOption && battleTypeOption.value || '5v5';


    if ( commandName === 'search' ) {
      const subcommand = options.getSubcommand();
      
      if ( subcommand === 'counter' ) {
        const opponent = options.getString( 'opponent' );
        const counter = options.getString( 'counter' );
        console.info( `${ user.tag } in #${ channel.name } searched counter: ${ opponent } vs ${ counter }, ${ range }, ${ battleType }` );
      }
      
      if ( subcommand === 'squad' ) {
        const squad = options.getString( 'squad' );
        console.info( `${ user.tag } in #${ channel.name } searched squad: ${ squad } on ${ position.value }, ${ range }, ${ battleType }` );
      }
    }

    if ( commandName === 'counter' ) {
      const opponent = options.getString( 'opponent' );
      console.info( `${ user.tag } in #${ channel.name } searched counter for squad: ${ opponent }, ${ power }, ${ range }, ${ battleType }` );
    }

    if( !interaction.isCommand()) { return; }

    const command = client.commands.get( interaction.commandName );

    try {
      await command.execute( interaction );
    } catch( e ) {
      await interaction.reply( { content:"There was an error while executing this command!", ephermeral: true } );
    }
  },
};