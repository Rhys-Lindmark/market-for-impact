import test from 'node:test';
import assert from 'node:assert/strict';
import {formatQalys,formatQalyText,isQalyQuantityLabel} from '../lib/health-display.mjs';
import {impactText} from '../lib/impact-metric.mjs';
test('QALY display has exactly two places, with unknown and signed cases',()=>{
 for(const [n,s] of [[1.3176616396423815,'1.32'],[0,'0.00'],[-1.317,'-1.32'],[1,'1.00'],[.004,'0.00'],[-.001,'0.00'],[null,'unknown']])assert.equal(formatQalys(n),s);
 assert.throws(()=>formatQalys(Infinity));
});
test('prose and labelled values preserve money, probabilities, dates and source URLs',()=>{
 const s='The total is 1.3176616396423815 US QALYs, 1.2913084068495337 Bay QALYs, and 1.2517785576602622 SF QALYs. Utility .0375; $100,000 gift. https://example.com/1.23456-QALYs';
 assert.equal(formatQalyText(s),'The total is 1.32 US QALYs, 1.29 Bay QALYs, and 1.25 SF QALYs. Utility .0375; $100,000 gift. https://example.com/1.23456-QALYs');
 assert.equal(formatQalyText('Health QALYs: 1.234567; **0.6181902634 clinical QALYs**.'),'Health QALYs: 1.23; **0.62 clinical QALYs**.');
 assert.equal(formatQalyText('1.234–2.345 net QALYs; .1, .2 and .3 clinical QALYs'),'1.23–2.35 net QALYs; 0.10, 0.20 and 0.30 clinical QALYs');
 assert.equal(formatQalyText('0.005 (95% CI –0.034 to 0.044 QALYs)'),'0.01 (95% CI -0.03 to 0.04 QALYs)');
 assert.equal(formatQalyText('Mass below $100K per DALY: 0; not a probability estimate.'),'Mass below $100K per DALY: 0; not a probability estimate.');
 assert.equal(impactText('1.23456 net QALYs; $3M per 10 QALYs'),'1.23 net QALYs; $300K per DALY');
});
test('QALY table cells round leading-dot, negative and scientific notation without rounding price cells',()=>{
 assert.equal(formatQalyText('1.260844034 | .018251571 | .038566034',{quantityOnly:true}),'1.26 | 0.02 | 0.04');
 assert.equal(formatQalyText('-1.2345 and 1e-3',{quantityOnly:true}),'-1.23 and 0.00');
 assert.equal(isQalyQuantityLabel('Net US QALYs'),true);
 assert.equal(isQalyQuantityLabel('USD per QALY'),false);
});
