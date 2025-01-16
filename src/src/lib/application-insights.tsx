"use client"

import { PropsWithChildren } from 'react';
import { useApplicationInsights } from '@/hooks/useApplicationInsights';


export function Insights({ children }: PropsWithChildren) {
    useApplicationInsights()

    return children
}
