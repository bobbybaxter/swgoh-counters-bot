const _ = require( 'lodash' );
const aliases = require( 'src/utils/toons' );

module.exports = app => async interaction => {
  const { options } = interaction;
  const subcommand = options.getSubcommand();

  if ( subcommand === 'alias' ) {
    if ( !options.character ) {
      // NOTE: Had to break this up into chunks due to Discord's 2000 character limit
      await interaction.deferReply();

      const sortedAliases = aliases.sort(( a, b ) => a.name > b.name ? 1 : -1 );
      const messageLineNum = 32;
      const chunks = new Array( Math.ceil( sortedAliases.length / messageLineNum ))
        .fill()
        .map(() => sortedAliases.splice( 0, messageLineNum ));

      return chunks.forEach( async chunk => {
        let characterString = `\u200B\n`;

        for ( let i = 0; i < chunk.length; i += 1 ) {
          const nameList = chunk[ i ].alias.join( ', ' );
          characterString += `**${ chunk[ i ].name }**: ${ nameList } \n\n`;
        }

        await interaction.followUp( characterString, { ephemeral: true } );
      } );
    } else {
      // TODO: search aliases based on response and return a character's aliases
    }
  }

  if ( subcommand === 'commands' ) {
    // TODO: provide the list of commands and descriptions
  }

  if ( subcommand === 'info' ) {
    // TODO: provide website info
  }

  return await interaction.reply( `Subcommand: ${ subcommand }` );
};