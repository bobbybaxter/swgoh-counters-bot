const { loadImage } = require( 'canvas' );

const GREY = '#808080';
const YELLOW = '#FEEE46';
const HARD_COUNTER_COLOR = '#e44747';
const SOFT_COUNTER_COLOR = '#9B47E4';

async function buildBackground( { ctx, canvasWidth, canvasHeight } ) {
  ctx.save();
  ctx.fillStyle = 'black';
  ctx.fillRect( 0, 0, canvasWidth, canvasHeight );
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = .20;
  const background = await loadImage( 'src/assets/bwspace-bg.png' );
  ctx.drawImage( background, 0, 0, background.width, background.height, 0, 0, background.width * .4 , background.height * .4 );
  ctx.restore();
}

async function buildCircle( ctx, img, x, y, color ) {
  ctx.save();
  ctx.beginPath();
  ctx.arc( x, y, 25, 0, 2 * Math.PI );
  ctx.lineWidth = 1;
  ctx.shadowColor = 'white';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = color === 'transparent' ? GREY : color;
  ctx.stroke();
  ctx.clip();

  try {
    ctx.drawImage( img, x - 25, y - 25, 50, 50 );
  } catch ( e ) {
    console.error( img, e );
  }
  
  ctx.restore();
}

async function buildCounterSquad( { ctx, squad, squadSize, toonImgs, type } ) {
  function selectStartingX( type ) {
    const values = {
      counter: squadSize === 5 ? 465 : 365,
      squad: squadSize === 5 ? 465 : 365,
      character: squadSize === 5 ? 565 : 415,
      playerSquad: squadSize === 5 ? 565 : 465,
    };

    return values[ type ];
  }

  let starting_x = selectStartingX( type );

  if ( type === 'character' ) {
    await buildCircle( ctx, toonImgs[ squad[ 0 ].id ], starting_x, 75, GREY );
  } else {
    for ( let i = 0; i < squadSize; i += 1 ) {
      await buildCircle( ctx, toonImgs[ squad[ i ].id ], starting_x, 75, GREY );
      starting_x += 50;
    }
  }
}

function buildMetricTitles( ctx, x, y, message ) {
  ctx.save();
  ctx.translate( x, y );
  ctx.font = '18px "Oswald Light"';
  ctx.fillStyle = 'white';
  ctx.rotate( -Math.PI/4 );
  ctx.fillText( message, 0, 0 );
  ctx.restore();
}

async function buildOpponentSquad( { ctx, squad, squadPower, squadSize, toonImgs, type } ) {
  function buildOpponentPower( power, x, y ) {
    ctx.save();
    ctx.font = '20px "Oswald Light"';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText( `Power: ${ power }`, x, y );
    ctx.restore();
  }

  const opponentCenter_x = squadSize === 5 ? 295 : 245;
  let starting_x = type === 'character' ? opponentCenter_x : 195;
  let starting_y = 80;

  if ( squadPower ) {
    buildOpponentPower( squadPower.toLocaleString(), opponentCenter_x, 57.5 );
    starting_y = 105;
  }

  if ( type === 'character' ) {
    await buildCircle( ctx, toonImgs[ squad[ 0 ].id ], starting_x, starting_y, GREY );
  } else {
    for ( let i = 0; i < squadSize; i += 1 ) {
      await buildCircle( ctx, toonImgs[ squad[ i ].id ], starting_x, starting_y, GREY );
      starting_x += 50;
    }
  }
}

function buildRowBackground( ctx, canvasWidth, starting_y, rowColor ) {
  ctx.save();
  ctx.fillStyle = rowColor === 'transparent' ? rowColor : `${ rowColor }40`;
  ctx.fillRect( 0, starting_y - 32, canvasWidth, 65 );
  ctx.restore();
}

async function buildRows( { ctx, canvasWidth, counters, rowNum, squadPower, squadSize, toonImgs, type } ) {
  function buildPowerText( ctx, x, y, message ) {
    ctx.save();
    ctx.font = '15px "Oswald"';
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillText( message.toLocaleString(), x - 40, y );
    ctx.restore();
  }

  function selectStartingX( type ) {
    if ( type === 'playerSquad' ) {
      return squadSize === 5 ? 540 : 440;
    } 
      
    return squadSize === 5 ? 465 : 365;
  }

  let starting_y = squadPower ? 175 : 150;

  for ( let i = 0; i < rowNum; i += 1 ) {
    let opponentStarting_x = 195;
    let counterStarting_x = selectStartingX( type );
    const rowColor = selectRowColor( counters[ i ].avgWin );
    buildRowBackground( ctx, canvasWidth, starting_y, rowColor );
    buildStats( ctx, counters[ i ], starting_y );
    ( type === 'playerSquad' ) && buildPowerText( ctx, counterStarting_x, starting_y, counters[ i ].counterPower );
  
    for ( let j = 0; j < squadSize; j += 1 ) {
      await buildCircle( ctx, toonImgs[ counters[ i ].opponentSquad[ j ].id ], opponentStarting_x, starting_y, GREY );
      await buildCircle( ctx, toonImgs[ counters[ i ].counterSquad[ j ].id ], counterStarting_x, starting_y, rowColor );
      opponentStarting_x += 50;
      counterStarting_x += 50;
    }
    
    starting_y += 65;
  }
}

function buildSeasonText( ctx, canvasHeight, seasonNums, seasonRangeType ) {
  let text;
  if ( !seasonRangeType || seasonRangeType === 'three' ) { text = `data from swgoh.gg, showing last three GAC seasons (${ seasonNums[ 0 ] }-${ seasonNums[ 1 ] })`;}
  if ( seasonRangeType === 'all' ) { text = `data from swgoh.gg, showing all GAC seasons (${ seasonNums[ 0 ] }-${ seasonNums[ 1 ] })`;}
  if ( seasonRangeType === 'last' ) { text = `data from swgoh.gg, showing last GAC season (${ seasonNums[ 0 ] })`;}
  ctx.save();
  ctx.font = '14px "Oswald"';
  ctx.fillStyle = "white";
  ctx.fillText( text, 10, canvasHeight - 10 );
  ctx.restore();
}

function buildStats( ctx, stats, y ) {
  ctx.save();
  ctx.font = '15px "Oswald"';
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText( stats.totalSeen.toLocaleString(), 35, y );
  ctx.fillText( `${ Math.round( stats.avgWin * 100 ) }%`, 85, y );
  ctx.fillText( stats.avgBanners, 125, y );
  ctx.restore();
}

function buildSubText( ctx, canvasHeight, canvasWidth ) {
  const date = new Date();
  ctx.save();
  ctx.font = '14px "Oswald"';
  ctx.fillStyle = '#FEEE46';
  ctx.textAlign = 'right';
  ctx.fillText( `image by swgohcounters.com - ${ date.toLocaleDateString() }`, canvasWidth - 10, canvasHeight - 10 );
  ctx.restore();
}

function buildTitleText( ctx, x, y, message ) {
  ctx.save();
  ctx.font = '30px "Oswald"';
  ctx.fillStyle = YELLOW;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText( message, x, y );
  ctx.restore();
}

function selectRowColor( avgWin ) {
  if ( avgWin >= .90 ) {return HARD_COUNTER_COLOR;}
  if ( avgWin >= .75 && avgWin < .90 ) {return SOFT_COUNTER_COLOR;}
  if ( avgWin < .75 ) {return 'transparent';}
}

module.exports = {
  buildBackground,
  buildCounterSquad,
  buildMetricTitles,
  buildOpponentSquad,
  buildRows,
  buildSeasonText,
  buildSubText,
  buildTitleText,
};