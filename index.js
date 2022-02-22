require( 'app-module-path' ).addPath( `${ __dirname }` );
require( 'dotenv-flow' ).config( {
  node_env: process.env.NODE_ENV || 'development',
} );
require( 'dotenv' ).config( { path: '.env' } );

const client = require( 'src/client' )();

client.login( process.env.TOKEN );