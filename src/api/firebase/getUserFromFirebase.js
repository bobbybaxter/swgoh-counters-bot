module.exports = ( { firebaseDb } ) => async discordId => {
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

  return user;
};