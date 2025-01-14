"use client"

import { PropsWithChildren, useRef } from 'react';
import { ApplicationInsights } from "@microsoft/applicationinsights-web"
import { useReportWebVitals } from 'next/web-vitals'

function createInsightsInstance() {
    const insights = new ApplicationInsights({
        config: {
            instrumentationKey: process.env["NEXT_PUBLIC_AZ_APP_INSIGHTS_INSTRUMENTATION_KEY"]
        }
    })

    insights.loadAppInsights()

    return insights
}

export function Insights({ children }: PropsWithChildren) {
    const insights = useRef<ApplicationInsights | undefined>(undefined)

    useReportWebVitals((metric) => {
        if (!insights.current) {
            insights.current = createInsightsInstance()
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
    })

    return children
}
