import clsx from 'clsx';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CellComponentProps } from 'react-window-v2';

import styles from './charts-cell.module.css';

import { TableItemProps } from '/@/renderer/components/item-list/item-table-list/item-table-list';
import {
    ItemTableListColumn,
    TableColumnContainer,
} from '/@/renderer/components/item-list/item-table-list/item-table-list-column';
import {
    CHART_CHANGE_COLUMN,
    CHART_RANK_COLUMN,
    ChartRow,
} from '/@/renderer/features/charts/utils/charts-utils';
import { Group } from '/@/shared/components/group/group';
import { Icon } from '/@/shared/components/icon/icon';
import { Text } from '/@/shared/components/text/text';
import { TableColumn } from '/@/shared/types/types';

type ChartCellProps = CellComponentProps<TableItemProps>;

type RankChange = {
    class: string;
    icon: 'arrowDown' | 'arrowRight' | 'arrowUp' | null;
    iconClass?: string;
    label: null | string;
};

const getRankChange = (
    previousRank: null | number | undefined,
    currentRank: number,
    newLabel: string,
): RankChange => {
    if (previousRank === null || previousRank === undefined) {
        return { class: styles.changeNew, icon: null, label: newLabel };
    }

    const diff = previousRank - currentRank;
    if (diff > 0) {
        return {
            class: styles.changeUp,
            icon: 'arrowUp',
            iconClass: styles.changeIconUp,
            label: String(diff),
        };
    }
    if (diff < 0) {
        return {
            class: styles.changeDown,
            icon: 'arrowDown',
            iconClass: styles.changeIconDown,
            label: String(Math.abs(diff)),
        };
    }
    return {
        class: styles.changeSame,
        icon: 'arrowRight',
        iconClass: styles.changeIconSame,
        label: null,
    };
};

const isHeaderRow = (props: ChartCellProps): boolean => {
    return !!props.enableHeader && props.rowIndex === 0;
};

const getChartRow = (props: ChartCellProps): ChartRow | null | undefined => {
    return (props.getRowItem?.(props.rowIndex) ?? props.data[props.rowIndex]) as
        | ChartRow
        | null
        | undefined;
};

const ChartCustomCell = ({
    renderValue,
    type,
    ...props
}: ChartCellProps & {
    renderValue: (item: ChartRow) => ReactNode;
    type: typeof CHART_CHANGE_COLUMN | typeof CHART_RANK_COLUMN;
}) => {
    if (isHeaderRow(props)) {
        return <ItemTableListColumn {...props} />;
    }

    const item = getChartRow(props);

    return (
        <TableColumnContainer {...props} type={type}>
            {item && renderValue(item)}
        </TableColumnContainer>
    );
};

export const ChartsCellComponent = (props: ChartCellProps) => {
    const { t } = useTranslation();
    const columnId = props.columns[props.columnIndex]?.id as TableColumn;

    if (columnId === CHART_RANK_COLUMN) {
        return (
            <ChartCustomCell
                {...props}
                renderValue={(item) => (
                    <Text className={styles.rank} fw={700} isNoSelect size="lg">
                        {item._chartRank}
                    </Text>
                )}
                type={CHART_RANK_COLUMN}
            />
        );
    }

    if (columnId === CHART_CHANGE_COLUMN) {
        return (
            <ChartCustomCell
                {...props}
                renderValue={(item) => {
                    const rankChange = getRankChange(
                        item._chartPreviousRank,
                        item._chartRank,
                        t('page.charts.new'),
                    );

                    return (
                        <Group gap={6} justify="center" wrap="nowrap">
                            {rankChange.icon !== null && (
                                <Icon
                                    className={rankChange.iconClass}
                                    icon={rankChange.icon}
                                    size="xl"
                                />
                            )}
                            {rankChange.label !== null && (
                                <Text className={clsx(styles.change, rankChange.class)} isNoSelect>
                                    {rankChange.label}
                                </Text>
                            )}
                        </Group>
                    );
                }}
                type={CHART_CHANGE_COLUMN}
            />
        );
    }

    return <ItemTableListColumn {...props} />;
};
