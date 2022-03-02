const { values } = require( 'lodash' );
const requireDir = require( 'require-directory' );

module.exports = () => {
  const modules = requireDir( module );
  return values( modules );
};
