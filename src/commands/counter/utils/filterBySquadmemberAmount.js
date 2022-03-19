module.exports = ( x, squadPower ) => {
  switch( x.squadmembers ) {
  case 5: return x.counterPower >= ( squadPower - ( squadPower * .05 ));
  case 4: return x.counterPower >= ( squadPower - ( squadPower * .10 ));
  case 3: return x.counterPower >= ( squadPower - ( squadPower * .15 ));
  case 2: return x.counterPower >= ( squadPower - ( squadPower * .20 ));
  case 1: return x.counterPower >= ( squadPower - ( squadPower * .25 ));
  default: return x;
  }
};