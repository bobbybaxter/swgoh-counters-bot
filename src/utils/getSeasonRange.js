const SeasonNums5v5 = [ 10, 11, 13, 15, 17, 19, 21, 23, 24 ];
const SeasonNums3v3 = [ 9, 12, 14, 16, 18, 20, 22 ];

module.exports = ( battleType, range ) => {
  const last5v5 = SeasonNums5v5[ SeasonNums5v5.length - 1 ];
  const last3v3 = SeasonNums3v3[ SeasonNums3v3.length - 1 ];

  if ( !range || range === 'three' ) {
    if ( battleType === '5v5' ) {
      return [ SeasonNums5v5[ SeasonNums5v5.length - 3 ], last5v5 ];
    }

    return [ SeasonNums3v3[ SeasonNums3v3.length - 3 ], last3v3 ];
  }

  if ( range === 'last' ) {
    if ( battleType === '5v5' ) {
      return [ last5v5, last5v5 ];
    }
    
    return [ last3v3, last3v3 ];
  }

  if ( range === 'all' ) { 
    if ( battleType === '5v5' ) {
      return [ SeasonNums5v5[ 0 ], last5v5 ];
    }
    
    return [ SeasonNums3v3[ 0 ], last3v3 ];
  }
};