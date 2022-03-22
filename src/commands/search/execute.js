const { getSeasonRange } = require( 'src/utils' );
const processCharacterImage = require( "./processCharacterImage" );
const processCounterImage = require( "./processCounterImage" );
const processSquadImage = require( "./processSquadImage" );

module.exports = app => async interaction => {
  const { log } = app;
  const { options } = interaction;
  const searchType = options.getSubcommand();
  const battleType = options.getString( 'battle_type' ) || '5v5';
  const seasonRangeType = options.getString( 'range' );
  const seasonNums = getSeasonRange( battleType, seasonRangeType );
  const selectedSeason = seasonNums[ 0 ];

  try {
    if ( searchType === 'counter' ) {
      return await processCounterImage( { 
        app,
        interaction,
        options,
        battleType,
        seasonRangeType,
        seasonNums,
        selectedSeason 
      } );
    }

    if ( searchType === 'squad' ) {
      return await processSquadImage( {
        app,
        interaction,
        options,
        battleType,
        seasonRangeType,
        seasonNums,
        selectedSeason,
      } );
    }

    if ( searchType === 'character' ) {
      return await processCharacterImage( {
        app,
        interaction,
        options,
        battleType,
        seasonRangeType,
        seasonNums,
        selectedSeason,
      } );
    }
  } catch ( err ) {
    log.error( err );
    return await interaction.reply( `Search Error` );
  }
};