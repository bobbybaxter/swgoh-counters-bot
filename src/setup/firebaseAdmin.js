const admin = require( 'firebase-admin' );
const serviceAccount = require( 'src/setup/firebase-service-account' );

module.exports = app => {
  const firebaseAdmin = admin.initializeApp( {
    credential: admin.credential.cert( serviceAccount ),
    databaseURL: process.env.FIREBASE_DB_URL,
  } );

  const firebaseDb = firebaseAdmin.database();

  return firebaseDb;
};
