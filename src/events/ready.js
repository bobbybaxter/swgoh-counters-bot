module.exports = app => {
  return {
    name: 'ready',
    once: true,
    execute( client ) {
      app.log.info( `${ client.user.tag } has started` );
    }
  };
};