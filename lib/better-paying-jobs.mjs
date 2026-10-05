// Discovery synthesis, not accepted organization reports or grant recommendations.
export const earningsResearchUpdated='2026-10-05';
export const earningsResearchLanes=[
 {
  id:'san-francisco',label:'SF / Bay Area',
  focus:'Employer-linked healthcare, skilled-trades and technology training; housing that makes regional jobs accessible.',
  candidates:[
   {name:'JVS Bay Area',url:'https://jvs.org/career-training/',mechanism:'Healthcare, trades and technology pathways. Request net earnings follow-up and the cost of additional training places.'},
   {name:'JobTrain / Per Scholas Bay Area',url:'https://perscholas.org/locations/san-francisco-bay/',mechanism:'A Menlo Park technology-training partnership. Test transfer from the New York trial rather than assuming the same earnings effect.'}
  ],
  next:'Prioritize JVS and the JobTrain partnership for earnings-specific review. Revisit existing employment and housing reports with income outcomes, not placement counts alone. Count benefits to Bay residents, including newcomers once resident; identify who gains access to which jobs.'
 },
 {
  id:'california',label:'California',
  focus:'Sector training in multiple labor markets, and statewide housing rules that open access to productive cities.',
  candidates:[
   {name:'JVS SoCal',url:'https://jvs-socal.org/our-career-training-programs/',mechanism:'Employer-supported banking, healthcare and other occupational training. This is a different organization from JVS Bay Area.'},
   {name:'Per Scholas Los Angeles',url:'https://perscholas.org/locations/los-angeles/',mechanism:'No-cost IT training for learners in LA County. Compare current demand and cohort costs with the older randomized evidence.'},
   {name:'California YIMBY',url:'https://cayimby.org/',mechanism:'Housing-policy discovery lead; the linked organization identifies as a 501(c)(4), not a tax-deductible charity. Verify the receiving entity and policy attribution.'}
  ],
  next:'Separate local training cohorts from statewide policy reach. Model California residents’ disposable income after housing and commuting costs; exclude out-of-state gains from this edition and do not count the same person twice.'
 },
 {
  id:'new-york-city',label:'New York City',
  focus:'Training providers with randomized earnings evidence, plus housing near high-opportunity jobs.',
  candidates:[
   {name:'St. Nicks Alliance',url:'https://stnicksalliance.org/workforce-development/',mechanism:'Sector training with a positive Year-10 earnings result in WorkAdvance. Establish whether today’s program and extra funding reproduce the evaluated model.'},
   {name:'Per Scholas New York',url:'https://perscholas.org/locations/new-york/',mechanism:'IT training across the five boroughs. Earlier earnings gains did not establish a significant Year-10 effect; use the full earnings trajectory.'},
   {name:'Open New York',url:'https://opennewyork.org/',mechanism:'Housing-supply advocacy. Evaluate additional homes and access to jobs separately from enacted-policy publicity.'}
  ],
  next:'Start with St. Nicks and Per Scholas because they have unusually relevant causal evidence. Apply the existing NYC metro boundary, including eligible New Jersey residents, rather than using campus location as the benefit boundary.'
 },
 {
  id:'usa',label:'USA',
  focus:'Evidence-rich sector training at national scale, housing supply and access to productive labor markets.',
  candidates:[
   {name:'Year Up United',url:'https://www.yearup.org/research',mechanism:'Training and internships with randomized long-run earnings evidence. Identify the current delivery model, all-in cost and employer contribution.'},
   {name:'Per Scholas',url:'https://perscholas.org/2024-annual-report/',mechanism:'A multi-city training network. An evaluated site’s result is not proof of equal impact at every campus.'},
   {name:'Institute for Progress',url:'https://ifp.org/about/',mechanism:'A policy lead already in USA research with a published conditional health-and-income model. Immigration and innovation pathways remain attribution-sensitive; use the current report rather than an obsolete health-only screen.'}
  ],
  next:'Prioritize Year Up and Per Scholas for income modeling, then assess housing reform at the policy level. Sum unique U.S. beneficiaries, not city population totals. Overseas gains do not enter the USA estimate.'
 }
];

// Illustrative screening scenarios only; none is an estimate for a named charity.
export const earningsScreen={
 costUSD:1000000,people:100,annualIncomeBeforeUSD:25000,editionShare:.8,
 scenarios:[
  {id:'low',label:'Shorter, smaller gains',annualIncomeGainUSD:2500,years:2,causalShare:.25},
  {id:'central',label:'Illustrative middle case',annualIncomeGainUSD:5000,years:5,causalShare:.5},
  {id:'high',label:'Larger, longer gains',annualIncomeGainUSD:7500,years:8,causalShare:.75}
 ]
};
