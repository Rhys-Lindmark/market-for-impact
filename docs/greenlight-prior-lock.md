# Greenlight v1 priors, before model execution

Recorded 2026-09-11 07:02:58 UTC, before first model calculation. Dispatch gpt-6-astra/low per parent, not runtime introspection. No threshold-based coefficient tuning.

Observed FY2024 expense $345,616; 75–80 people served weekly. Unique annual starts/completions unavailable. Estimate treatment-episode equivalents from weekly census × active weeks / mean attended weeks × dedup. Never multiply weekly census by 52 and call that unique patients. These are accounting equivalents, not measured completions. Positive response fraction includes incomplete or ineffective courses and diagnosis/modality mismatch.

Six joint worlds and subjective prior weights: funding null .20, clinical null .15, harm .10, cautious .20, central .25, favorable .10. No clinical probability is an estimated trial confidence interval.

All worlds cash expense345616, gift10000 capped10000, weekly77.5 except favorable80/cautious75. Cautious:44 active weeks/30 attended weeks ×.80dedup; .25cashadditionality, .40accessadditionality, .35benefitingfraction, .04utility ×.25years, .001harmQ per delivered episode, .95Bay. Central:48/24 ×.90dedup; .50cash, .60access, .50benefiting, .06utility ×.50years, .0005harm, .98Bay. Favorable:50/16 ×.95dedup; .80cash, .80access, .75benefiting, .10utility ×.75years, .0002harm,1Bay. Harm world central throughput, .50cash,.60access,0benefiting,.003harm,.98Bay. Funding null cash0; clinical null central throughput/cash but benefit0/harm0.

Years are incremental useful symptom-improvement time before recovery or equivalent alternative care, never lifetime prevention. Utility and duration are explicit judgments; no trial-quality CBT claimed. The Dickerson paper's .067 QALY is not directly copied: its 26.8 additional depression-free days × stated .4 decrement /365 gives .02937 by a simple mapping, not .067. This unresolved reconciliation is not proof the paper is wrong. The model uses separately exposed utility×duration priors, with a DFD-based sensitivity. No suicide deaths credited.
