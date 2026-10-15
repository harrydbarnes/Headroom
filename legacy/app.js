// Original formulas retained only for migration parity tests.
function repayment(loan,rate,years){const n=years*12,r=rate/1200;return r===0?loan/n:loan*r/(1-Math.pow(1+r,-n));}
function sdlt(p){return Math.min(Math.max(p-125000,0),125000)*.02+Math.min(Math.max(p-250000,0),675000)*.05+Math.min(Math.max(p-925000,0),575000)*.10+Math.max(p-1500000,0)*.12;}
