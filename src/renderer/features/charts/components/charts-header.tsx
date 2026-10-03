import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '/@/renderer/components/page-header/page-header';
import { useChartsContext } from '/@/renderer/features/charts/components/charts-context';
import { ChartsToolbar } from '/@/renderer/features/charts/components/charts-toolbar';
import { formatMonthName } from '/@/renderer/features/charts/utils/charts-utils';
import { LibraryHeaderBar } from '/@/renderer/features/shared/components/library-header-bar';
import { ActionIcon } from '/@/shared/components/action-icon/action-icon';
import { Flex } from '/@/shared/components/flex/flex';
import { Group } from '/@/shared/components/group/group';
import { Stack } from '/@/shared/components/stack/stack';
import { LibraryItem } from '/@/shared/types/domain-types';

interface ChartsHeaderProps {
    onStepPeriod: (direction: -1 | 1) => void;
    period: 'month' | 'week' | 'year';
}

const PeriodNavigation = ({ onStep }: { onStep: (direction: -1 | 1) => void }) => {
    const { t } = useTranslation();

    return (
        <Group gap="xs" wrap="nowrap">
            <ActionIcon
                icon="arrowLeftS"
                iconProps={{ size: 'lg' }}
                onClick={() => onStep(-1)}
                tooltip={{ label: t('page.charts.previousPeriod') }}
                variant="subtle"
            />
            <ActionIcon
                icon="arrowRightS"
                iconProps={{ size: 'lg' }}
                onClick={() => onStep(1)}
                tooltip={{ label: t('page.charts.nextPeriod') }}
                variant="subtle"
            />
        </Group>
    );
};

export const ChartsHeader = ({ onStepPeriod, period }: ChartsHeaderProps) => {
    const { t } = useTranslation();
    const { filters, rows } = useChartsContext();

    const { month: selectedMonth, week: selectedWeek, year: selectedYear } = filters;

    const periodLabel = useMemo(() => {
        if (period === 'year') {
            return String(selectedYear);
        }

        if (period === 'month') {
            return `${formatMonthName(selectedYear, selectedMonth)} ${selectedYear}`;
        }

        return `${t('datetime.weekLong')} ${selectedWeek}, ${selectedYear}`;
    }, [period, selectedMonth, selectedWeek, selectedYear, t]);

    return (
        <Stack gap={0}>
            <PageHeader>
                <Flex align="center" justify="space-between" w="100%">
                    <LibraryHeaderBar ignoreMaxWidth>
                        <LibraryHeaderBar.PlayButton
                            itemType={LibraryItem.SONG}
                            songs={rows}
                            variant="filled"
                        />

                        <LibraryHeaderBar.Title>{t('page.charts.title')}</LibraryHeaderBar.Title>

                        <LibraryHeaderBar.Badge>{periodLabel}</LibraryHeaderBar.Badge>
                    </LibraryHeaderBar>

                    <PeriodNavigation onStep={onStepPeriod} />
                </Flex>
            </PageHeader>

            <ChartsToolbar />
        </Stack>
    );
};
