const { loadImage } = require( 'canvas' );
const toons = require( 'src/utils/toons' );

module.exports = async () => {
  async function loadImages( arr ) {
    let images = {};
  
    for ( var i = 0; i < arr.length; i += 1 ) {
      const img = await loadImage( `src/assets/characterImages/${ arr[ i ].id }.png` );
      images[ arr[ i ].id ] = img;
    }
  
    return images;
  }

  const images = await loadImages( [ { id: 'BLANK', name: 'Blank' }, ...toons ] );
  return images;
};