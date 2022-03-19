module.exports = app => {
  return {
    character: require( './character' )( app ),
    counter: require( './counter' )( app ),
    firebase: require( './firebase' )( app ),
    patreon: require( './patreon' )( app ),
    player: require( './player' )( app ),
    squad: require( './squad' )( app )
  };
};