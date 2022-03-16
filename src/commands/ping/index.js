module.exports = app => {
  return {
    data: require( './data' )( app ),
    execute: require( "./execute" )( app )
  };
};