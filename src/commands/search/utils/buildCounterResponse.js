const { MessageAttachment } = require( 'discord.js' );
const { createCanvas, registerFont } = require( 'canvas' );
const { 
  buildBackground,
  buildCounterSquad,
  buildMetricTitles,
  buildOpponentSquad,
  buildRows,
  buildSeasonText,
  buildSubText,
  buildTitleText,
} = require( 'src/utils/imageTools' );

registerFont( 'src/assets/fonts/Oswald-Regular.ttf', { family: 'Oswald' } );
registerFont( 'src/assets/fonts/Oswald-Light.ttf', { family: 'Oswald Light' } );
registerFont( 'src/assets/fonts/Oswald-ExtraLight.ttf', { family: 'Oswald ExtraLight' } ); // currently not working with node-canvas

module.exports = async ( toonImgs, battleType, seasonRangeType, seasonNums, opponentSquad, counterSquad, response ) => {
  const rowNum = response.length < 10 ? response.length : 10;
  const squadSize = parseInt( battleType.charAt( 0 ), 10 );
  const canvasHeight = rowNum > 1 ? 210 + (( rowNum - 1 ) * 65 ) : 210;
  const canvasWidth = squadSize === 5 ? 700 : 500;
  
  const canvas = createCanvas( canvasWidth, canvasHeight );
  const ctx = canvas.getContext( '2d' );

  await buildBackground( { ctx, canvasWidth, canvasHeight } );
  buildTitleText( ctx, ( squadSize === 5 ? 295 : 245 ), 25, 'Opponent' );
  buildTitleText( ctx, ( squadSize === 5 ? 565 : 415 ), 25, 'Counter' );
  buildMetricTitles( ctx, 20, 100, 'Battles' );
  buildMetricTitles( ctx, 67.5, 100, 'Avg Win %' );
  buildMetricTitles( ctx, 115, 100, 'Avg Banners' );
  await buildOpponentSquad( { ctx, squad: opponentSquad, squadSize, toonImgs, type: 'counter' } );
  await buildCounterSquad( { ctx, squad: counterSquad, squadSize, toonImgs, type: 'counter' } );
  await buildRows( { ctx, canvasWidth, counters: response, rowNum, squadSize, toonImgs } );
  buildSubText( ctx, canvasHeight, canvasWidth );
  buildSeasonText( ctx, canvasHeight, seasonNums, seasonRangeType );

  return new MessageAttachment( canvas.toBuffer(), 'counter.png' );
};