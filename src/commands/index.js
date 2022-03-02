const { values } = require( 'lodash' );
const requireDir = require( 'require-directory' );

module.exports = app => {
  const modules = requireDir( module, { visit: m => m( app ) } );
  return values( modules );
};
