#!/usr/bin/env python3
"""Extract SFF's FY2025 grantee-total table into a reviewed source snapshot."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

import pdfplumber


EXPECTED_ROW_COUNT = 424
EXPECTED_TOTAL_USD = 49_516_694


def parse_amount(value: str) -> int:
    digits = re.sub(r"[^0-9]", "", value or "")
    if not digits:
        raise ValueError(f"Missing amount in source cell: {value!r}")
    return int(digits)


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: extract-sff-fy25-pdf.py INPUT.pdf OUTPUT.json")
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    source_bytes = input_path.read_bytes()
    rows: list[dict[str, object]] = []

    with pdfplumber.open(input_path) as document:
        if len(document.pages) != 11:
            raise ValueError(f"Expected 11 pages, found {len(document.pages)}")
        for page_number, page in enumerate(document.pages, start=1):
            table = page.extract_table()
            if not table or table[0] != ["GRANTEE PARTNER", "TOTAL FUNDING"]:
                raise ValueError(f"Unexpected table header on page {page_number}: {table[0] if table else None}")
            for name, amount in table[1:]:
                normalized_name = re.sub(r"\s+", " ", name or "").strip()
                if not normalized_name:
                    raise ValueError(f"Missing grantee name on page {page_number}")
                rows.append({
                    "granteeName": normalized_name,
                    "totalFundingUsd": parse_amount(amount),
                    "sourcePage": page_number,
                })

    if len(rows) != EXPECTED_ROW_COUNT:
        raise ValueError(f"Expected {EXPECTED_ROW_COUNT} rows, found {len(rows)}")
    if len({row["granteeName"] for row in rows}) != len(rows):
        raise ValueError("Duplicate grantee name in SFF source table")
    total = sum(int(row["totalFundingUsd"]) for row in rows)
    if total != EXPECTED_TOTAL_USD:
        raise ValueError(f"Expected ${EXPECTED_TOTAL_USD:,}, found ${total:,}")

    snapshot = {
        "version": "sff-fy25-grantee-totals-source-v0.1",
        "retrievedAt": "2026-08-31T01:07:00.000Z",
        "source": {
            "publisher": "The San Francisco Foundation",
            "portfolioPageUrl": "https://sff.org/what-we-do/grantmaking-to-advance-racial-equity/2025-grantmaking-data/",
            "pdfUrl": "https://sff.org/wp-content/uploads/2025/11/FY25-Grants-Analysis-List-of-Grantees-and-Amounts.pdf",
            "pdfSha256": hashlib.sha256(source_bytes).hexdigest(),
            "pdfPageCount": 11,
            "pdfTitle": "SFF Programmatic Grantmaking - Funded Organizations and Individuals",
            "sourcePublishedDate": "2025-11-05",
            "portfolioDataAsOf": "2025-07-22",
        },
        "period": {
            "label": "Fiscal Year 2025",
            "startDate": "2024-07-01",
            "endDate": "2025-06-30",
        },
        "portfolioSummary": {
            "reportedGrantCount": 585,
            "reportedOrganizationCount": 424,
            "reportedIndividualCount": 21,
            "reportedRoundedFundingUsd": 49_500_000,
            "publishedRowCount": len(rows),
            "publishedRowTotalFundingUsd": total,
        },
        "amountSemantics": "Each PDF row is a grantee partner's aggregate total funding in SFF's FY2025 programmatic portfolio, not an individual grant record.",
        "coverageBoundary": "The PDF publishes one name and aggregate total per row. It does not publish row-level grant count, purpose, strategy, duration, county, recipient type, legal entity, EIN, donation vehicle, outcomes, effectiveness, or current room for more funding.",
        "rows": rows,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Extracted {len(rows)} SFF rows totaling ${total:,}.")


if __name__ == "__main__":
    main()
