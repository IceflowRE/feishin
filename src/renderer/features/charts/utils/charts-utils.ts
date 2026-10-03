import { Song } from '/@/shared/types/domain-types';
import { TableColumn } from '/@/shared/types/types';

export type ChartDateFilters = {
    month: number;
    week: number;
    year: number;
};

export type ChartPeriod = 'month' | 'week' | 'year';
export type ChartRow = Song & {
    _chartPreviousRank: null | number;
    _chartRank: number;
};

export type ChartScope = 'community' | 'personal';

export const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// Reused generic table slots for chart-specific data
export const CHART_RANK_COLUMN = TableColumn.ROW_INDEX;
export const CHART_CHANGE_COLUMN = TableColumn.SKIP;

// Calculates Thursday-anchored ISO-8601 week and year.
export const getIsoYearAndWeek = (date: Date): { isoWeek: number; isoYear: number } => {
    const thursday = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    thursday.setDate(thursday.getDate() - dayNumber + 3);

    const isoYear = thursday.getFullYear();

    const firstThursday = new Date(thursday.valueOf());
    firstThursday.setMonth(0, 1);
    if (firstThursday.getDay() !== 4) {
        firstThursday.setMonth(0, 1 + ((4 - firstThursday.getDay() + 7) % 7));
    }

    const isoWeek = 1 + Math.round((thursday.valueOf() - firstThursday.valueOf()) / MS_PER_WEEK);
    return { isoWeek, isoYear };
};

// Dec 28th always falls in the last ISO week of its year.
export const getIsoWeeksInYear = (year: number): number =>
    getIsoYearAndWeek(new Date(year, 11, 28)).isoWeek;

// Gets the Monday starting a specific ISO week.
export const getIsoWeekMonday = (year: number, week: number): Date => {
    const jan4 = new Date(year, 0, 4);
    const jan4DayNumber = (jan4.getDay() + 6) % 7;
    const week1Monday = new Date(jan4);

    week1Monday.setDate(jan4.getDate() - jan4DayNumber);
    const target = new Date(week1Monday);
    target.setDate(week1Monday.getDate() + (week - 1) * 7);

    return target;
};

export const addMonths = (date: Date, delta: number): Date => {
    return new Date(date.getFullYear(), date.getMonth() + delta, 1);
};

export const formatMonthName = (year: number, month: number): string => {
    return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long' });
};
