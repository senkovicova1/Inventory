import React from 'react';

export const isEmail = (email) => (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(email)

export const unitToBasic = (amount, unit)=>{
  let values = {kg:1000,g:1,dkg:10,l:1000,dcl:100,ml:1,tsp:1,tbsp:3,cup:48,čl:1,pl:3,šálka:48,ks:1,pcs:1};
  if (!Object.keys(values).includes(unit)) {
    return 0;
  }
  return parseFloat(amount) * values[unit];
}
