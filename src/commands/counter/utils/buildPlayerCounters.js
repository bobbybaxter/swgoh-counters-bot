const { MessageAttachment } = require( 'discord.js' );
const { createCanvas, registerFont } = require( 'canvas' );
const {
  buildBackground,
  buildOpponentSquad,
  buildMetricTitles,
  buildRows,
  buildSeasonText,
  buildSubText,
  buildTitleText,
} = require( 'src/utils/imageTools' );

registerFont( 'src/assets/fonts/Oswald-Regular.ttf', { family: 'Oswald' } );
registerFont( 'src/assets/fonts/Oswald-Light.ttf', { family: 'Oswald Light' } );
registerFont( 'src/assets/fonts/Oswald-ExtraLight.ttf', { family: 'Oswald ExtraLight' } ); // currently not working with node-canvas

function determineCanvasHeight( rowNum, squadPower ) {
  const extraForSquadPower = squadPower ? 25 : 0;
  if ( rowNum > 1 ) {
    return ( 210 + (( rowNum - 1 ) * 65 )) + extraForSquadPower;
  } else {
    return 210 + extraForSquadPower;
  }
}

module.exports = async ( {
  toonImgs,
  battleType,
  seasonRangeType,
  seasonNums,
  squad,
  squadPower,
  counters 
} ) => {
  const rowNum = counters.length < 25 ? counters.length : 25;
  const squadSize = parseInt( battleType.charAt( 0 ), 10 );
  const canvasHeight = determineCanvasHeight( rowNum, squadPower );
  const canvasWidth = squadSize === 5 ? 800 : 600;
  const metricTitle_y = squadPower ? 130 : 105;
  const squadPowerTitle_x = squadSize === 5 ? 455 : 355;
  
  const canvas = createCanvas( canvasWidth, canvasHeight );
  const ctx = canvas.getContext( '2d' );

  await buildBackground( { ctx, canvasWidth, canvasHeight } );
  buildTitleText( ctx, ( squadSize === 5 ? 295 : 245 ), 25, 'Opponent' );
  buildTitleText( ctx, ( squadSize === 5 ? 640 : 490 ), 25, 'Counter' );

  buildMetricTitles( ctx, 20, metricTitle_y, 'Battles' );
  buildMetricTitles( ctx, 67.5, metricTitle_y, 'Avg Win %' );
  buildMetricTitles( ctx, 115, metricTitle_y, 'Avg Banners' );
  buildMetricTitles( ctx, squadPowerTitle_x, metricTitle_y, 'Squad Power' );

  await buildOpponentSquad( { ctx, squad, squadPower, squadSize, toonImgs } );
  
  await buildRows( { ctx, canvasWidth, counters, rowNum, squadPower, squadSize, toonImgs, type: 'playerSquad' } );
  buildSubText( ctx, canvasHeight, canvasWidth );
  buildSeasonText( ctx, canvasHeight, seasonNums, seasonRangeType );

  return new MessageAttachment( canvas.toBuffer(), 'counter.png' );
};