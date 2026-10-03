import type { ChartQuery } from '/@/shared/types/domain-types';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import {
    addMonths,
    ChartDateFilters,
    ChartPeriod,
    getIsoWeekMonday,
    getIsoWeeksInYear,
    getIsoYearAndWeek,
} from '/@/renderer/features/charts/utils/charts-utils';
import { useGeneralSettings } from '/@/renderer/store';
import { parseIntParam, setSearchParam } from '/@/renderer/utils/query-params';

const CHART_FILTER_KEYS = {
    MONTH: 'chartMonth',
    WEEK: 'chartWeek',
    YEAR: 'chartYear',
} as const;

const isValidMonth = (value: number | undefined): value is number =>
    value !== undefined && Number.isInteger(value) && value >= 1 && value <= 12;

const isValidWeek = (value: number | undefined): value is number =>
    value !== undefined && Number.isInteger(value) && value >= 1 && value <= 53;

const isValidYear = (value: number | undefined): value is number =>
    value !== undefined && Number.isInteger(value);

// Week view uses the ISO year (differs from the calendar year around Jan 1 / Dec 31)
const getDefaultFilters = (period: ChartPeriod): ChartDateFilters => {
    const now = new Date();
    const { isoWeek, isoYear } = getIsoYearAndWeek(now);

    return {
        month: now.getMonth() + 1,
        week: isoWeek,
        year: period === 'week' ? isoYear : now.getFullYear(),
    };
};

const parseFilters = (
    searchParams: URLSearchParams,
    defaults: ChartDateFilters,
): ChartDateFilters => {
    const yearParam = parseIntParam(searchParams, CHART_FILTER_KEYS.YEAR);
    const month = parseIntParam(searchParams, CHART_FILTER_KEYS.MONTH);
    const week = parseIntParam(searchParams, CHART_FILTER_KEYS.WEEK);

    const year = isValidYear(yearParam) ? yearParam : defaults.year;
    const rawWeek = isValidWeek(week) ? week : defaults.week;

    return {
        month: isValidMonth(month) ? month : defaults.month,
        week: Math.min(rawWeek, getIsoWeeksInYear(year)),
        year,
    };
};

export const useChartsFilters = () => {
    const settings = useGeneralSettings();
    const [searchParams, setSearchParams] = useSearchParams();

    const period: ChartPeriod = settings.chartsPeriod ?? 'month';

    const defaults = useMemo(() => getDefaultFilters(period), [period]);

    const filters = useMemo(() => parseFilters(searchParams, defaults), [defaults, searchParams]);

    const query = useMemo<ChartQuery>(() => {
        const params: ChartQuery = {
            limit: settings.chartsTopSongs ?? 25,
            scope: settings.chartsScope ?? 'personal',
            year: filters.year,
        };

        if (period === 'month') {
            params.month = filters.month;
        } else if (period === 'week') {
            params.week = filters.week;
        }

        return params;
    }, [
        filters.month,
        filters.week,
        filters.year,
        period,
        settings.chartsScope,
        settings.chartsTopSongs,
    ]);

    const setFilters = useCallback(
        (value: ((previous: ChartDateFilters) => ChartDateFilters) | ChartDateFilters) => {
            setSearchParams(
                (previousParams) => {
                    const previousFilters = parseFilters(previousParams, defaults);
                    const nextFilters =
                        typeof value === 'function' ? value(previousFilters) : value;

                    let params = setSearchParam(
                        previousParams,
                        CHART_FILTER_KEYS.YEAR,
                        nextFilters.year,
                    );

                    params = setSearchParam(params, CHART_FILTER_KEYS.MONTH, nextFilters.month);

                    return setSearchParam(params, CHART_FILTER_KEYS.WEEK, nextFilters.week);
                },
                { replace: true },
            );
        },
        [defaults, setSearchParams],
    );

    const stepPeriod = useCallback(
        (direction: -1 | 1) => {
            setFilters((previous) => {
                if (period === 'year') {
                    return {
                        ...previous,
                        year: previous.year + direction,
                    };
                }

                if (period === 'month') {
                    const shifted = addMonths(
                        new Date(previous.year, previous.month - 1, 1),
                        direction,
                    );

                    return {
                        ...previous,
                        month: shifted.getMonth() + 1,
                        year: shifted.getFullYear(),
                    };
                }

                // Calendar arithmetic (not +/- 7*24h) so DST changes can't land on Sunday
                const shiftedMonday = getIsoWeekMonday(previous.year, previous.week);
                shiftedMonday.setDate(shiftedMonday.getDate() + direction * 7);
                const { isoWeek, isoYear } = getIsoYearAndWeek(shiftedMonday);

                return {
                    ...previous,
                    week: isoWeek,
                    year: isoYear,
                };
            });
        },
        [period, setFilters],
    );

    return {
        filters,
        period,
        query,
        setFilters,
        stepPeriod,
    };
};
