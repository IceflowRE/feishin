import type {
    ChartEntry,
    ChartQuery,
    ServerListItemWithCredential,
} from '/@/shared/types/domain-types';

import {
    QueryFunctionContext,
    useIsFetching,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import { NavidromeController } from '/@/renderer/api/navidrome/navidrome-controller';
import { ChartRow } from '/@/renderer/features/charts/utils/charts-utils';

export type ChartsApiClientProps = {
    server: ServerListItemWithCredential;
    serverId: string;
};

const CHARTS_QUERY_KEY = 'charts';

const mapChartEntry = (entry: ChartEntry): ChartRow => ({
    ...entry.song,
    _chartPreviousRank: entry.previousRank ?? null,
    _chartRank: entry.rank,
    playCount: entry.playCount,
});

const selectChartRows = (data: ChartEntry[]): ChartRow[] => data.map(mapChartEntry);

export const useChartsQuery = (apiClientProps: ChartsApiClientProps, queryParams: ChartQuery) =>
    useSuspenseQuery({
        queryFn: ({ signal }: QueryFunctionContext) =>
            NavidromeController.getChart({
                apiClientProps: {
                    ...apiClientProps,
                    signal,
                },
                query: queryParams,
            }),
        queryKey: [apiClientProps.serverId, CHARTS_QUERY_KEY, queryParams] as const,
        select: selectChartRows,
    });

const isChartsQuery = (query: { queryKey: readonly unknown[] }) =>
    query.queryKey[1] === CHARTS_QUERY_KEY;

export const useChartsRefresh = () => {
    const queryClient = useQueryClient();
    const isRefreshing = useIsFetching({ predicate: isChartsQuery }) > 0;

    const refresh = useCallback(() => {
        void queryClient.refetchQueries({ predicate: isChartsQuery, type: 'active' });
    }, [queryClient]);

    return { isRefreshing, refresh };
};
