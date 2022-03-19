module.exports = app => async interaction => {
  const sent = await interaction.reply( { content: 'Pinging...', fetchReply: true } );
  return await interaction.editReply( `Roundtrip latency: ${ sent.createdTimestamp - interaction.createdTimestamp }ms` );
};