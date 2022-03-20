// TODO: build a meta command that will pull the meta teams based on the characters given
module.exports = app => [
  require( './counter' )( app ),
  require( './link' )( app ),
  require( './ping' )( app ),
  require( './search' )( app )
];