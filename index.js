const _ = require( 'lodash' );
require( 'app-module-path' ).addPath( `${ __dirname }` );
require( 'dotenv-flow' ).config( {
  node_env: process.env.NODE_ENV || 'development',
} );
require( 'dotenv' ).config( { path: '.env' } );
const config = require( './.config.json' );

const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[ environment ];
const finalConfig = _.merge( defaultConfig, environmentConfig );
const logFactory = require( 'src/setup/log' )( finalConfig );

const firebaseConnection = require( 'src/setup/firebaseConnection' );

firebaseConnection();

const app = {
  log: logFactory,
};

app.toonImgs = require( 'src/setup/toonImgs' )();
app.firebaseDb = require( 'src/setup/firebaseAdmin' )( app );
app.client = require( 'src/client' )( app );

module.exports = app;
