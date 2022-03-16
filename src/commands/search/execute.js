const { getSeasonRange } = require( 'src/utils' );
const processCharacterImage = require( "./processCharacterImage" );
const processCounterImage = require( "./processCounterImage" );
const processSquadImage = require( "./processSquadImage" );

module.exports = ( { toonImgs } ) => async interaction => {
  const { options } = interaction;
  const searchType = options.getSubcommand();
  const battleType = options.getString( 'battle_type' ) || '5v5';
  const seasonRangeType = options.getString( 'range' );
  const seasonNums = getSeasonRange( battleType, seasonRangeType );
  const selectedSeason = seasonNums[ 0 ];

  try {
    if ( searchType === 'counter' ) {
      return await processCounterImage( { 
        toonImgs,
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
        toonImgs,
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
        toonImgs,
        interaction,
        options,
        battleType,
        seasonRangeType,
        seasonNums,
        selectedSeason,
      } );
    }
  } catch ( err ) {
    console.error( 'Search Error :>> ', err );
    return await interaction.editReply( `Search Error` );
  }
};