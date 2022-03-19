const _ = require( "lodash" );

module.exports = ( routes, {
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
    routes.firebase.createGuild( guildToCreate );
  }

  // add user to guild list
  if ( !_.isEmpty( currentGuildInFirebase )
    && !currentGuildInFirebase.guildTierUsers.includes( id )
  ) {
    currentGuildInFirebase.guildTierUsers.push( id );
    routes.firebase.updateGuild( currentGuildInFirebase );
  }
};