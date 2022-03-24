const aliases = require( 'src/utils/toons' );
const squadTemplates = require( 'src/utils/squadTemplates' );

function buildAliasResponse( nameString ) {
  let responseString = `\u200B\n`;
  let isTooLong = false;
  const toonMatches = aliases.filter( x => x.alias.find( y => y.toLowerCase().includes( nameString ))) || [];
  const squadMatches = squadTemplates.filter( x => x.alias.find( y => y.toLowerCase().includes( nameString.toLowerCase()))) || [];

  if ( !toonMatches.length && !squadMatches.length ) {
    return `No characters or squads matching "${ nameString }"`;
  }
  
  toonMatches && toonMatches.forEach(( x, i ) => {
    let proposedAddition;
    if ( !isTooLong ) {
      const aliasList = x.alias.join( ', ' );
      if ( i === 0 ) {
        proposedAddition = `\nCharacters matching "${ nameString }":\n`;
        proposedAddition += `- **${ x.name }**: ${ aliasList }\n`;
      } else {
        proposedAddition = `- **${ x.name }**: ${ aliasList }\n`;
      }

      if ( responseString.length + proposedAddition.length < 1900 ) {
        responseString += proposedAddition;
      } else {
        isTooLong = true;
      }
    }
  } );

  squadMatches && squadMatches.forEach(( x, i ) => {
    let proposedAddition;
    if ( !isTooLong ) {
      const aliasList = x.alias.join( ', ' );
      if ( i === 0 ) {
        proposedAddition = `\nSquads matching "${ nameString }":\n`;
        proposedAddition += `- **${ x.name }** - ${ x.squadAbbr }:
        - ${ aliasList }\n`;
      } else {
        proposedAddition = `- **${ x.name }** - ${ x.squadAbbr }:
        - ${ aliasList }\n`;
      }

      if ( responseString.length + proposedAddition.length < 1900 ) {
        responseString += proposedAddition;
      } else {
        isTooLong = true;
      }
    }
  } );

  if ( isTooLong ) { 
    responseString += `\nThere are too many results for this search.  Try your search again with more specific keywords.`;
  }
  
  return responseString;
}

module.exports = app => async ( interaction, commands ) => {
  const { options } = interaction;
  const subcommand = options.getSubcommand();

  if ( subcommand === 'alias' ) {
    const nameString = options.getString( 'name' );
    const responseString = buildAliasResponse( nameString );
    return await interaction.reply( {
      content: responseString,
      ephemeral: true
    } );
  }

  if ( subcommand === 'commands' ) {
    let responseString = `\u200B\n`;

    commands.forEach( command => {
      const { name, options, description } = command.data;
      
      if ( !options.length ) {
        responseString += `\n**/${ name }**: ${ description }\n`;
      } else {
        if ( options[ 0 ].type ) {
          responseString += `\n**/${ name }**: ${ description }\n`;
        } else {
          options.forEach( option => {
            responseString += `\n**/${ name } ${ option.name }**: ${ option.description }\n`;
          } );
        }
      }
    } );

    return await interaction.reply( {
      content: responseString,
      ephemeral: true
    } );
  }

  if ( subcommand === 'tips' ) {
    let responseString = `\u200B\n`;
    responseString += `\n1. Here are some different ways you can search for squads:
      **single character search**: 
        - ex. gas
        - will search for squads where GAS is the leader
      **full squad search**: 
        - ex. !gas
        - will search for the 501st (GAS L) squad
      **multiple character search**: 
        - ex. gas/arc/rex
        - will search squads that have ARC and Rex, and GAS as the leader\n`;
    responseString += `\n2. **/search character** is the broadest search.  it will search for squads where the searched character is in ANY position (leader or not).
      - ex. squad: jkr position: Offense
      - will search for any offensive squads that has Jedi Knight Revan, no matter if he's the leader or not\n`;
    responseString += `\n3. **/search squad** is more focused.  it will search for one squad, either on offense or defense.
      - ex. squad: gg/nute position: Defense
      - will search for counters against defensive squads where Grievous is the leader and the squad has Nute Gunray.\n`;
    responseString += `\n4. **/search counter** is the most focused search.  it will search one specific counter against one specific opponent.
      - ex. opponent: cls counter: !cls
      - will search for counters where the opponent squad has CLS as the leader and the counter is the specific CLS squad of CLS/Threepio/C-3PO/Chewie/Han\n`;
    responseString += `\n5. **/counter** is very similar to "/search squad".  you specify the defensive opponent and it will return counter options based on your roster.
      - ex. opponent: !ggnute
      - will search for counters against the pre-determined Grievous L squad with Nute Gunray and return counter options based on your roster, also showing the power levels of each squad\n`;
    responseString += `\n6. don't forget the options:
      - for the **/search** commands, you have the options to adjust the range of GAC seasons to search across and to search between 5v5 and 3v3 counters
      - for the **/counter** command, you also have the options to search based on the defensive squad's power level and to return all counters instead of the default 25`;
    return await interaction.reply( {
      content: responseString,
      ephemeral: true
    } );
  }

  return await interaction.reply( `Subcommand: ${ subcommand }` );
};