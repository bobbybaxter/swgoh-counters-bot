const _ = require( 'lodash' );
const getRefreshedTokenFactory = require( 'src/api/patreon/getRefreshedToken' );
const getStatusFactory = require( 'src/api/patreon/getStatus' );
const getSwgohInfoFactory = require( 'src/api/player/getSwgohInfo' );
const getGuildByGuildIdFactory = require( 'src/api/firebase/getGuildByGuildId' );
const createGuildFactory = require( 'src/api/firebase/createGuild' );
const deleteGuildFactory = require( 'src/api/firebase/deleteGuild' );
const updateGuildFactory = require( 'src/api/firebase/updateGuild' );
const updateUserFactory = require( 'src/api/firebase/updateUser' );

const MEMBERTIERS = [ '', 'Carbonite', 'Bronzium', 'Chromium' ];
const GUILDTIERS = [ 'Aurodium' ];

const handleAddGuild = ( data, {
  id,
  currentGuildInFirebase,
  guildIdFromSWGOHGG,
  guildNameFromSWGOHGG,
} ) => {
  // add new guild to guild list
  if ( _.isEmpty( currentGuildInFirebase )) {
    const guildToCreate = {
      id: guildIdFromSWGOHGG,
      name: guildNameFromSWGOHGG,
      guildTierUsers: id,
    };
    data.createGuild( guildToCreate );
  }

  // add user to guild list
  if ( !_.isEmpty( currentGuildInFirebase )
    && !currentGuildInFirebase.guildTierUsers.includes( id )
  ) {
    currentGuildInFirebase.guildTierUsers.push( id );
    data.updateGuild( currentGuildInFirebase );
  }
};

const handleRemoveGuild = ( data, {
  id,
  oldGuildInFirebase,
} ) => {
  const updatedGuildTierUsers = oldGuildInFirebase.guildTierUsers.filter( x => x !== id );
  // if there are no guildTierUsers after removal, delete guild record
  if ( _.isEmpty( updatedGuildTierUsers )) {
    data.deleteGuild( oldGuildInFirebase.id );
    return {};
  }
  // if there are guildTierUsers after removal, just update record
  const guildToUpdate = {
    ...oldGuildInFirebase,
    guildTierUsers: updatedGuildTierUsers,
  };
  data.updateGuild( guildToUpdate );
  return guildToUpdate;
};

module.exports = app => async discordId => {
  let accessToken,
    allyCode,
    expiresIn,
    guildIdFromSwgoh,
    guildNameFromSwgoh,
    patreonUser,
    refreshToken,
    swgohUnits,
    swgohUser;

  const data = {
    getRefreshedToken: getRefreshedTokenFactory( app ),
    getStatus: getStatusFactory( app ),
    getSwgohInfo: getSwgohInfoFactory( app ),
    getGuildByGuildId: getGuildByGuildIdFactory( app ),
    createGuild: createGuildFactory( app ),
    deleteGuild: deleteGuildFactory( app ),
    updateGuild: updateGuildFactory( app ),
    updateUser: updateUserFactory( app ),
  };

  const { firebaseDb } = app;

  const userObj = await firebaseDb
    .ref( 'users' )
    .orderByChild( 'discordId' )
    .equalTo( discordId )
    .once( 'value' )
    .then( snapshot => ( snapshot.val()) || '' );

  if ( !userObj ) {return {};}

  const user = Object.values( userObj )[ 0 ];
  const userId = Object.keys( userObj )[ 0 ];
  user.id = userId;

  const { guildId, id, tier } = user;
  ( {
    accessToken,
    allyCode,
    expiresIn,
    refreshToken,
  } = user );

  // patreon check
  if ( accessToken ) {
    try {
      const now = new Date();
      if ( expiresIn && expiresIn < now.toISOString()) {
        const refreshedPatronToken = await data.getRefreshedToken( accessToken, refreshToken );
        accessToken = refreshedPatronToken.accessToken;
        refreshToken = refreshedPatronToken.refreshToken;
        expiresIn = refreshedPatronToken.expiresIn;
      }

      // REVIEW: is there a way to refactor this component
      //  so we could skip getting this status on every call to save time?
      patreonUser = await data.getStatus( accessToken );

      if ( id === process.env.ADMIN_ID || process.env.VIP_IDS.split( ',' ).includes( id )) {
        patreonUser = {
          patronStatus: 'Active Patron',
          tier: 'Aurodium',
        };
      }
    } catch ( err ) {
      app.log.error( 'getPatreonStatus error', err );
      patreonUser = {
        patronStatus: 'Patreon Not Responding',
        tier,
      };
    }
  }
  // guild check
  if ( allyCode ) {
    // sanitize allycode
    if ( allyCode.includes( '-' )) {
      allyCode = allyCode.split( '-' ).join( '' );
      user.allyCode = allyCode;
    }
    try {
      const swgohUserResponse = await data.getSwgohInfo( allyCode ); // TODO: pass in SWGOH Units into ineraction
      swgohUser = swgohUserResponse.data;
      swgohUnits = swgohUserResponse.units; 
      guildIdFromSwgoh = swgohUser && swgohUser.guild_id ? swgohUser.guild_id.toString() : '';
      guildNameFromSwgoh = swgohUser && swgohUser.guild_name ? swgohUser.guild_name : '';
    } catch ( err ) {
      app.log.error( 'getSwgohInfo error', err );
      guildNameFromSwgoh = 'swgoh.gg Not Responding';
    }
  }

  const oldGuildInFirebase = guildId ? await data.getGuildByGuildId( guildId ) : {};
  const currentGuildInFirebase = swgohUser ? await data.getGuildByGuildId( guildIdFromSwgoh ) : {};

  const isNowGuildTier = patreonUser ? GUILDTIERS.includes( patreonUser.tier ) : false;
  const isNowMemberTier = patreonUser && MEMBERTIERS.includes( patreonUser.tier );
  const wasGuildTier = GUILDTIERS.includes( tier );
  const wasMemberTier = MEMBERTIERS.includes( tier );
  const guildHasChanged = swgohUser ? guildId !== guildIdFromSwgoh : false;
  const patreonTierHasChanged = patreonUser ? tier !== patreonUser.tier : false;
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
      await handleRemoveGuild( data, oldGuildInfo );
    }

    // if currentGuild is in firebse, add id to current guild in firebase
    if ( !_.isEmpty( currentGuildInFirebase )) {
      await handleAddGuild( data, currentGuildInfo );
    }
  }

  // if Patreon tier changes
  if ( patreonTierHasChanged ) {
    if ( wasMemberTier && isNowGuildTier ) {
      await handleAddGuild( data, currentGuildInfo );
    }

    // REVIEW: do i need to add !_.isEmpty(currentGuildInFirebase)?
    if ( wasGuildTier && isNowMemberTier ) {
      await handleRemoveGuild( data, oldGuildInfo );
    }
  }

  if ( isNowGuildTier && guildIdFromSwgoh && _.isEmpty( currentGuildInFirebase )) {
    await handleAddGuild( data, currentGuildInfo );
  }

  const updatedUser = {
    ...user,
    accessToken,
    expiresIn,
    refreshToken,
    guildId: guildIdFromSwgoh || '',
    guildName: guildNameFromSwgoh || '',
    patronStatus: patreonUser ? patreonUser.patronStatus : '',
    tier: patreonUser ? patreonUser.tier : '',
  };

  if ( updatedUser !== user ) {
    data.updateUser( updatedUser );
  }

  const guildData = {
    isCurrentGuildInFirebase: !_.isEmpty( currentGuildInFirebase ),
    isNowGuildTier,
  };

  return { guildData, fbUser: user, units: swgohUnits };
};