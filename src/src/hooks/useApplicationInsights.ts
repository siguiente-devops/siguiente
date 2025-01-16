import { ApplicationInsights } from "@microsoft/applicationinsights-web"
import { useReportWebVitals } from "next/web-vitals"
import { useRef } from "react"

function instrumentationKey() {
    return process.env["NEXT_PUBLIC_AZ_APP_INSIGHTS_INSTRUMENTATION_KEY"]
}

function createInsightsInstance(instrumentationKey: string) {
    const insights = new ApplicationInsights({
        config: {
            instrumentationKey
        }
    })

    insights.loadAppInsights()

    return insights
}

export function useApplicationInsights() {
    const insights = useRef<ApplicationInsights | undefined>(undefined)

    useReportWebVitals((metric) => {
        const key = instrumentationKey()

        if (key) {
            if (!insights.current) {
                insights.current = createInsightsInstance(key)
            }
    
            if (metric.navigationType === "navigate") {
                insights.current.trackPageView()
            }
    
            insights.current.trackMetric({
                name: metric.name,
                average: metric.value
            }, {
                navigationType: metric.navigationType,
                rating: metric.rating
            })
        }
    })
}
