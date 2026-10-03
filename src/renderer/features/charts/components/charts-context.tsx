import { createContext, Dispatch, SetStateAction, useContext } from 'react';

import { ChartDateFilters, ChartRow } from '/@/renderer/features/charts/utils/charts-utils';

export type ChartsContextValue = {
    filters: ChartDateFilters;
    rows: ChartRow[];
    setFilters: Dispatch<SetStateAction<ChartDateFilters>>;
    setRows: Dispatch<SetStateAction<ChartRow[]>>;
};

export const ChartsContext = createContext<ChartsContextValue | null>(null);

export const useChartsContext = () => {
    const ctx = useContext(ChartsContext);
    if (!ctx) {
        throw new Error('useChartsContext must be used within a ChartsContext.Provider');
    }
    return ctx;
};
