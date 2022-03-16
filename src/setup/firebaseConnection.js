const firebase = require( 'firebase/app' );
const fbConfig = require( './firebase-config.js' );

module.exports = () => {
  if ( !firebase.getApps().length ) {
    firebase.initializeApp( fbConfig );
  }
};
