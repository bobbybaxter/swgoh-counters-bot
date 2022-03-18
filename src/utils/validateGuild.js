const _ = require( 'lodash' );
const { handleAddGuild, handleRemoveGuild } = require( 'src/utils' );

module.exports = async ( log, routes, user ) => {
  let allyCode, swgohUser, units, guildIdFromSwgoh, guildNameFromSwgoh;
  const { guildId, id, tier } = user;
  const memberTiers = [ '', 'Carbonite', 'Bronzium', 'Chromium' ];
  const guildTiers = [ 'Aurodium' ];
  ( { allyCode } = user );
  if ( allyCode ) {
    // sanitize allycode
    if ( allyCode.includes( '-' )) {
      allyCode = allyCode.split( '-' ).join( '' );
      user.allyCode = allyCode;
    }
  }

  try {
    const swgohUserResponse = await routes.player.getSwgohInfo( allyCode );
    swgohUser = swgohUserResponse.data;
    ( { units } = swgohUserResponse ); 
    guildIdFromSwgoh = swgohUser && swgohUser.guild_id ? swgohUser.guild_id.toString() : '';
    guildNameFromSwgoh = swgohUser && swgohUser.guild_name ? swgohUser.guild_name : '';
  } catch ( err ) {
    log.error( 'getSwgohInfo error', err );
    throw err;
  }

  const oldGuildInFirebase = guildId ? await routes.firebase.getGuildByGuildId( guildId ) : {};
  const currentGuildInFirebase = swgohUser ? await routes.firebase.getGuildByGuildId( guildIdFromSwgoh ) : {};

  const isNowGuildTier = user ? guildTiers.includes( user.tier ) : false;
  const isNowMemberTier = user && memberTiers.includes( user.tier );
  const wasGuildTier = guildTiers.includes( tier );
  const wasMemberTier = memberTiers.includes( tier );
  const guildHasChanged = swgohUser ? guildId !== guildIdFromSwgoh : false;
  const patreonTierHasChanged = user ? tier !== user.tier : false;
  const oldGuildInfo = { id, oldGuildInFirebase };
  const currentGuildInfo = {
    id,
    currentGuildInFirebase,
    guildIdFromSwgoh,
    guildNameFromSwgoh,
  };

  if ( guildHasChanged && ( wasGuildTier || isNowGuildTier )) {
    // if oldGuild is in firebase, remove id from old guild in firebase
    if ( !_.isEmpty( oldGuildInFirebase )) {
      await handleRemoveGuild( routes, oldGuildInfo );
    }

    // if currentGuild is in firebse, add id to current guild in firebase
    if ( !_.isEmpty( currentGuildInFirebase )) {
      await handleAddGuild( routes, currentGuildInfo );
    }
  }

  // if Patreon tier changes
  if ( patreonTierHasChanged ) {
    if ( wasMemberTier && isNowGuildTier ) {
      await handleAddGuild( routes, currentGuildInfo );
    }

    // REVIEW: do i need to add !_.isEmpty(currentGuildInFirebase)?
    if ( wasGuildTier && isNowMemberTier ) {
      await handleRemoveGuild( routes, oldGuildInfo );
    }
  }

  if ( isNowGuildTier && guildIdFromSwgoh && _.isEmpty( currentGuildInFirebase )) {
    await handleAddGuild( routes, currentGuildInfo );
  }

  const guildData = {
    isCurrentGuildInFirebase: !_.isEmpty( currentGuildInFirebase ),
    isNowGuildTier,
  };

  return {
    guildData,
    updatedUser: {
      ...user,
      allyCode
    },
    units
  };
};