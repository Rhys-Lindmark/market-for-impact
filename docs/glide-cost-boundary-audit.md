# GLIDE cost-source correction — September 8, 2026

Issue196. Primary source: GLIDE Impact Report2024–2025, physical PDF page7 / printed page11, Wells Fargo sponsor example. The $100,000 supported39 households and support services including case management and housing-stability workshops. Spending is not itemized; the2022 launch reference does not date the whole cohort. Current Welcome Center page conditions case management on availability. Source rechecked September8 by direct PDF extraction and visual inspection.

Correction: the retained rounded20% uplift is an unverified current-cost contingency, not a documented bill for services omitted from the historical anchor. Potential overlap is explicit. No evidence supports an exact20% numerical correction. Central $3,077 / .072 QALYs ×10 = $427,361.11 remains unchanged. Added sensitivity holds .072 fixed and uses exact $100,000/39 cost: $356,125.36 per10 QALYs. It is not a marginal funding offer.

Native workbook: GLIDE Rental CEA, B6/B62 versions updated, A7/B7 identify cost-source recheck, D10/D49 cost notes corrected. New B63 formula `=(100000/39)/B51*10` reads back356125.3561253561; B52 retains427361.1111111112. Google-rendered D49 and B63:D63 inspected: wrapping and number formatting readable; neighboring cells/formulas preserved. Sheet remains private.

Verification:274 unit tests, lint and production build passed. Focused GLIDE/Compass mobile checks passed (4pass,2phone-only skips); independent audit caught an initially misplaced test assertion, corrected before publication. Full release CI and canonical deployment still required.

Source: https://www.glide.org/wp-content/uploads/2026/01/GLIDE-Impact-Report-2024-2025.pdf
