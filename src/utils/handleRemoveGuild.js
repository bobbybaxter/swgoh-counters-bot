const _ = require( "lodash" );

module.exports = ( routes, {
  id,
  oldGuildInFirebase,
} ) => {
  const updatedGuildTierUsers = oldGuildInFirebase.guildTierUsers.filter( x => x !== id );
  // if there are no guildTierUsers after removal, delete guild record
  if ( _.isEmpty( updatedGuildTierUsers )) {
    routes.firebase.deleteGuild( oldGuildInFirebase.id );
    return {};
  }
  // if there are guildTierUsers after removal, just update record
  const guildToUpdate = {
    ...oldGuildInFirebase,
    guildTierUsers: updatedGuildTierUsers,
  };
  routes.firebase.updateGuild( guildToUpdate );
  return guildToUpdate;
};