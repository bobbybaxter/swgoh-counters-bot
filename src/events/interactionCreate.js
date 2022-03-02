module.exports = {
  name: 'interactionCreate',
  async execute( interaction, client ) {
    console.info( `${ interaction.user.tag } in #${ interaction.channel.name } triggered an interaction.` );

    if( !interaction.isCommand()) { return; }

    const command = client.commands.get( interaction.commandName );

    try {
      await command.execute( interaction );
    } catch( e ) {
      console.error( e );
      await interaction.reply( { content:"There was an error while executing this command!", ephermeral: true } );
    }
  },
};