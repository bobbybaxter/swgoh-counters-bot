module.exports = async ( log, routes, user ) => {
  let accessToken, expiresIn, patreonUser, patronStatus, refreshToken, tier;
  const { id } = user;
  ( { accessToken, expiresIn, refreshToken, tier } = user );

  if ( accessToken ) {
    try {
      const now = new Date();
      if ( expiresIn && expiresIn < now.toISOString()) {
        const refreshedPatronToken = await routes.patreon.getRefreshedToken( accessToken, refreshToken );
        accessToken = refreshedPatronToken.accessToken;
        refreshToken = refreshedPatronToken.refreshToken;
        expiresIn = refreshedPatronToken.expiresIn;
      }

      patreonUser = await routes.patreon.getStatus( accessToken );
      ( { patronStatus, tier } = patreonUser );

      if ( id === process.env.ADMIN_ID || process.env.VIP_IDS.split( ',' ).includes( id )) {
        patronStatus = 'Active Patron';
        tier = 'Aurodium';
      }
    } catch ( err ) {
      log.error( 'getPatreonStatus error', err );
      throw err;
    }
  }
    
  return {
    ...user,
    accessToken,
    expiresIn,
    refreshToken,
    patronStatus,
    tier
  };
};