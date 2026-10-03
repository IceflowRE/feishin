import { hashKey } from '@tanstack/react-query';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './charts-content.module.css';

import { ItemTableList } from '/@/renderer/components/item-list/item-table-list/item-table-list';
import { ItemTableListColumnConfig } from '/@/renderer/components/item-list/types';
import { ChartsCellComponent } from '/@/renderer/features/charts/components/charts-cell';
import { useChartsContext } from '/@/renderer/features/charts/components/charts-context';
import {
    ChartsApiClientProps,
    useChartsQuery,
} from '/@/renderer/features/charts/utils/charts-query';
import {
    CHART_CHANGE_COLUMN,
    CHART_RANK_COLUMN,
} from '/@/renderer/features/charts/utils/charts-utils';
import { Spinner } from '/@/shared/components/spinner/spinner';
import { Text } from '/@/shared/components/text/text';
import { ChartQuery, LibraryItem } from '/@/shared/types/domain-types';
import { TableColumn } from '/@/shared/types/types';

const DEFAULT_COLUMNS: ItemTableListColumnConfig[] = [
    { align: 'center', id: CHART_RANK_COLUMN, isEnabled: true, pinned: null, width: 40 },
    { align: 'center', id: CHART_CHANGE_COLUMN, isEnabled: true, pinned: null, width: 40 },
    { align: 'start', id: TableColumn.TITLE_COMBINED, isEnabled: true, pinned: null, width: 500 },
    {
        align: 'start',
        autoSize: true,
        id: TableColumn.ALBUM,
        isEnabled: true,
        pinned: null,
        width: 220,
    },
    { align: 'center', id: TableColumn.PLAY_COUNT, isEnabled: true, pinned: null, width: 60 },
];

interface ChartsContentProps {
    apiClientProps: ChartsApiClientProps;
    queryParams: ChartQuery;
}

interface ChartsTableProps extends ChartsContentProps {
    columns: ItemTableListColumnConfig[];
    onColumnResized: (columnId: TableColumn, width: number) => void;
}

const ChartsTable = ({
    apiClientProps,
    columns,
    onColumnResized,
    queryParams,
}: ChartsTableProps) => {
    const { t } = useTranslation();
    const { setRows } = useChartsContext();
    const { data: rows } = useChartsQuery(apiClientProps, queryParams);

    useEffect(() => {
        setRows(rows);
    }, [rows, setRows]);

    if (!rows.length) {
        return <Text className={styles.empty}>{t('page.charts.noSongs')}</Text>;
    }

    return (
        <ItemTableList
            CellComponent={ChartsCellComponent}
            columns={columns}
            data={rows}
            enableExpansion={false}
            enableHeader
            enableSelection
            itemType={LibraryItem.SONG}
            onColumnResized={onColumnResized}
            size="default"
        />
    );
};

export const ChartsContent = (props: ChartsContentProps) => {
    const [columns, setColumns] = useState<ItemTableListColumnConfig[]>(DEFAULT_COLUMNS);

    const handleColumnResized = useCallback((columnId: TableColumn, width: number) => {
        setColumns((prev) =>
            prev.map((column) => (column.id === columnId ? { ...column, width } : column)),
        );
    }, []);

    return (
        <div className={styles.container}>
            <Suspense fallback={<Spinner container />}>
                <ChartsTable
                    {...props}
                    columns={columns}
                    key={hashKey([props.apiClientProps.serverId, props.queryParams])}
                    onColumnResized={handleColumnResized}
                />
            </Suspense>
        </div>
    );
};
