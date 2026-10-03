import { useMemo, useState } from 'react';

import { ChartsContent } from '/@/renderer/features/charts/components/charts-content';
import {
    ChartsContext,
    ChartsContextValue,
} from '/@/renderer/features/charts/components/charts-context';
import { ChartsHeader } from '/@/renderer/features/charts/components/charts-header';
import { ChartsUnsupported } from '/@/renderer/features/charts/components/charts-unsupported';
import { useChartsFilters } from '/@/renderer/features/charts/hooks/use-charts-filters';
import { useChartsSupport } from '/@/renderer/features/charts/hooks/use-charts-support';
import { ChartsApiClientProps } from '/@/renderer/features/charts/utils/charts-query';
import { ChartRow } from '/@/renderer/features/charts/utils/charts-utils';
import { AnimatedPage } from '/@/renderer/features/shared/components/animated-page';
import { PageErrorBoundary } from '/@/renderer/features/shared/components/page-error-boundary';
import { useCurrentServerWithCredential } from '/@/renderer/store';

export const ChartsRoute = () => {
    const server = useCurrentServerWithCredential();
    const { isSupported, reason } = useChartsSupport();
    const { filters, period, query, setFilters, stepPeriod } = useChartsFilters();
    const [rows, setRows] = useState<ChartRow[]>([]);

    const apiClientProps = useMemo<ChartsApiClientProps | null>(
        () => (server ? { server, serverId: server.id } : null),
        [server],
    );

    const value = useMemo<ChartsContextValue>(
        () => ({ filters, rows, setFilters, setRows }),
        [filters, rows, setFilters],
    );

    if (!isSupported && reason) {
        return (
            <AnimatedPage>
                <ChartsUnsupported reason={reason} />
            </AnimatedPage>
        );
    }

    return (
        <ChartsContext.Provider value={value}>
            <AnimatedPage>
                <ChartsHeader onStepPeriod={stepPeriod} period={period} />

                {apiClientProps && (
                    <ChartsContent apiClientProps={apiClientProps} queryParams={query} />
                )}
            </AnimatedPage>
        </ChartsContext.Provider>
    );
};

const ChartsRouteWithBoundary = () => {
    return (
        <PageErrorBoundary>
            <ChartsRoute />
        </PageErrorBoundary>
    );
};

export default ChartsRouteWithBoundary;
