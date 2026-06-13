from __future__ import annotations


class ClimateCopilot:
    def answer(self, prompt: str, rankings: list[dict]) -> dict:
        text = prompt.lower()
        top = rankings[:5]
        if "flood" in text:
            focus = sorted(rankings, key=lambda row: row["flood_risk"], reverse=True)[:5]
            explanation = "Flood vulnerability is highest where rainfall, river levels, and soil saturation align."
            risk_analysis = "The current twin flags riverine and coastal districts for near-term watch conditions."
        elif "drought" in text:
            focus = sorted(rankings, key=lambda row: row["drought_risk"], reverse=True)[:5]
            explanation = "Drought vulnerability is driven by rainfall deficit, low NDVI, and depleted reservoir storage."
            risk_analysis = "Arid and rain-shadow districts require water budgeting and crop advisories."
        elif "heat" in text:
            focus = sorted(rankings, key=lambda row: row["heatwave_risk"], reverse=True)[:5]
            explanation = "Heatwave exposure increases when maximum temperature anomalies persist with humidity stress."
            risk_analysis = "Urban heat islands and desert districts show the highest occupational exposure risk."
        else:
            focus = top
            explanation = "The national risk picture combines flood, drought, heatwave, and water stress indicators."
            risk_analysis = "Immediate interventions should prioritize districts with high composite risk and rising trends."

        return {
            "explanation": explanation,
            "risk_analysis": risk_analysis,
            "recommended_actions": [
                "Issue district-level advisories through state emergency operation centers.",
                "Prioritize reservoir releases, water tankers, or drainage checks based on dominant risk.",
                "Update crop and health advisories every 24 hours while risk remains high.",
            ],
            "chart": {
                "type": "bar",
                "data": [
                    {"district": row["district_name"], "risk": row["composite_risk"]}
                    for row in focus
                ],
            },
            "districts": focus,
        }
