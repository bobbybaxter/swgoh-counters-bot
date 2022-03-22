const _ = require( 'lodash' );

module.exports = async ( log, routes, fbUser, updatedUser ) => {
  let currentGuildInFirebase,
    guildIdFromSwgoh,
    guildNameFromSwgoh,
    swgohUser,
    units = [];

  const { handleAddGuild, handleRemoveGuild } = require( 'src/utils' );
  const { allyCode, guildId, id, tier } = fbUser;
  const memberTiers = [ '', 'Carbonite', 'Bronzium', 'Chromium' ];
  const discordTiers = [ 'Aurodium' ];
  
  if ( allyCode ) {
    try {
      const swgohUserResponse = await routes.player.getSwgohInfo( allyCode );
      swgohUser = swgohUserResponse.data;
      ( { units } = swgohUserResponse ); 
      guildIdFromSwgoh = swgohUser && swgohUser.guild_id ? swgohUser.guild_id.toString() : '';
      guildNameFromSwgoh = swgohUser && swgohUser.guild_name ? swgohUser.guild_name : '';
    } catch ( err ) {
      log.error( err );
      throw err;
    }

    const oldGuildInFirebase = guildId ? await routes.firebase.getGuildByGuildId( guildId ) : {};
    currentGuildInFirebase = swgohUser ? await routes.firebase.getGuildByGuildId( guildIdFromSwgoh ) : {};

    const isNowDiscordTier = discordTiers.includes( updatedUser.tier );
    const isNowMemberTier = memberTiers.includes( updatedUser.tier );
    const wasDiscordTier = discordTiers.includes( tier );
    const wasMemberTier = memberTiers.includes( tier );
    const guildHasChanged = swgohUser ? guildId !== guildIdFromSwgoh : false;
    const patreonTierHasChanged = tier !== fbUser.tier;
    const oldGuildInfo = { id, oldGuildInFirebase };
    const currentGuildInfo = {
      id,
      currentGuildInFirebase,
      guildIdFromSwgoh,
      guildNameFromSwgoh,
    };

    if ( guildHasChanged && ( wasDiscordTier || isNowDiscordTier )) {
    // if oldGuild is in firebase, remove id from old guild in firebase
      if ( !_.isEmpty( oldGuildInFirebase )) {
        await handleRemoveGuild( routes, oldGuildInfo );
      }

      // if currentGuild is in firebase, add id to current guild in firebase
      if ( !_.isEmpty( currentGuildInFirebase )) {
        await handleAddGuild( routes, currentGuildInfo );
      }
    }

    // if Patreon tier changes
    if ( patreonTierHasChanged ) {
      if ( wasMemberTier && isNowDiscordTier ) {
        await handleAddGuild( routes, currentGuildInfo );
      }

      if ( wasDiscordTier && isNowMemberTier ) {
        await handleRemoveGuild( routes, oldGuildInfo );
      }
    }

    if ( isNowDiscordTier && guildIdFromSwgoh && _.isEmpty( currentGuildInFirebase )) {
      await handleAddGuild( routes, currentGuildInfo );
    }
  }

  return {
    isCurrentGuildInFirebase: !_.isEmpty( currentGuildInFirebase ),
    units
  };
};