require( 'app-module-path' ).addPath( `${ __dirname }` );
require( 'dotenv-flow' ).config( {
  node_env: process.env.NODE_ENV || 'development',
} );
require( 'dotenv' ).config( { path: '.env' } );

const app = {};

app.toonImgs = require( 'src/setup/toonImgs' )();
app.client = require( 'src/client' )( app );

module.exports = app;
