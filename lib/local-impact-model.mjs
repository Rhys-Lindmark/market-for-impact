// Explicit geography priors, not measured shipments or inferred resident outcomes.
export function localImpact({gift,sharedQ,sfShare,bayShare,independentHarm=0,harmSfShare,harmBayShare}) {
 if(independentHarm>0&&(harmSfShare===undefined||harmBayShare===undefined))throw Error('Explicit independent harm locations required');
 harmSfShare??=0;harmBayShare??=0;
 for(const n of [gift,sharedQ,sfShare,bayShare,independentHarm,harmSfShare,harmBayShare])if(!Number.isFinite(n))throw Error('Finite inputs required');
 if(gift<=0||independentHarm<0||sfShare<0||sfShare>bayShare||bayShare>1||harmSfShare<0||harmSfShare>harmBayShare||harmBayShare>1)throw Error('Invalid scope');
 const sfQ=sharedQ*sfShare-independentHarm*harmSfShare;
 const bayQ=sharedQ*bayShare-independentHarm*harmBayShare;
 const outsideBayQ=sharedQ*(1-bayShare)-independentHarm*(1-harmBayShare);
 return {sfQ,bayQ,outsideBayQ,nationalQ:sharedQ-independentHarm,sfUsdPer10Q:sfQ>0?10*gift/sfQ:null,bayUsdPer10Q:bayQ>0?10*gift/bayQ:null};
}
export function spilloverScenario(directQ,gift,epsilonSf,epsilonBay) {
 if(!Number.isFinite(directQ)||!Number.isFinite(gift)||gift<=0||![epsilonSf,epsilonBay].every(Number.isFinite)||epsilonSf<0||epsilonBay<epsilonSf)throw Error('Invalid spillover inputs');
 const sfQ=directQ*epsilonSf,bayQ=directQ*epsilonBay;
 return {sfQ,bayQ,globalInclusiveQ:directQ+bayQ,sfUsdPer10Q:sfQ>0?10*gift/sfQ:null,bayUsdPer10Q:bayQ>0?10*gift/bayQ:null};
}
