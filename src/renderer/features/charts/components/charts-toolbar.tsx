import { openContextModal } from '@mantine/modals';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChartsContext } from '/@/renderer/features/charts/components/charts-context';
import { useChartsRefresh } from '/@/renderer/features/charts/utils/charts-query';
import {
    ChartPeriod,
    ChartScope,
    getIsoWeekMonday,
    getIsoWeeksInYear
} from '/@/renderer/features/charts/utils/charts-utils';
import { FilterBar } from '/@/renderer/features/shared/components/filter-bar';
import { RefreshButton } from '/@/renderer/features/shared/components/refresh-button';
import { useGeneralSettings, useSettingsStoreActions } from '/@/renderer/store';
import { Button } from '/@/shared/components/button/button';
import { Divider } from '/@/shared/components/divider/divider';
import { Flex } from '/@/shared/components/flex/flex';
import { Group } from '/@/shared/components/group/group';
import { NumberInput } from '/@/shared/components/number-input/number-input';
import { SegmentedControl } from '/@/shared/components/segmented-control/segmented-control';
import { Select } from '/@/shared/components/select/select';
import { Stack } from '/@/shared/components/stack/stack';
import { Text } from '/@/shared/components/text/text';

const ChartsFilters = () => {
    const { t } = useTranslation();
    const settings = useGeneralSettings();
    const { setSettings } = useSettingsStoreActions();

    const { filters, setFilters } = useChartsContext();
    const { month: selectedMonth, week: selectedWeek, year: selectedYear } = filters;

    const topSongs = settings.chartsTopSongs ?? 25;
    const period = settings.chartsPeriod ?? 'month';
    const scope = settings.chartsScope ?? 'personal';

    const scopeOptions = useMemo(
        () => [
            {
                label: t('page.charts.personal'),
                value: 'personal',
            },
            {
                label: t('page.charts.community'),
                value: 'community',
            },
        ],
        [t],
    );

    const periodOptions = useMemo(
        () => [
            {
                label: t('common.year'),
                value: 'year',
            },
            {
                label: t('datetime.monthLong'),
                value: 'month',
            },
            {
                label: t('datetime.weekLong'),
                value: 'week',
            },
        ],
        [t],
    );

    const monthOptions = useMemo(
        () =>
            Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;

                return {
                    label: String(month),
                    value: String(month),
                };
            }),
        [],
    );

    const weekOptions = useMemo(
        () =>
            Array.from({ length: getIsoWeeksInYear(selectedYear) }, (_, index) => {
                const week = index + 1;
                const monthAbbrev = getIsoWeekMonday(selectedYear, week).toLocaleDateString(
                    undefined,
                    { month: 'short' },
                );

                return {
                    label: `${week} (${monthAbbrev})`,
                    value: String(week),
                };
            }),
        [selectedYear],
    );

    const handleYearBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const value = Number(event.currentTarget.value);

        if (!Number.isInteger(value)) {
            event.currentTarget.value = String(selectedYear);
            return;
        }

        if (value !== selectedYear) {
            setFilters((previous) => ({
                ...previous,
                year: value,
            }));
        }
    };

    const handleMonthChange = (value: null | string) => {
        if (value === null) {
            return;
        }

        const month = Number(value);

        if (!Number.isInteger(month) || month < 1 || month > 12) {
            return;
        }

        setFilters((previous) => ({
            ...previous,
            month,
        }));
    };

    const handleWeekChange = (value: null | string) => {
        if (value === null) {
            return;
        }

        const week = Number(value);
        const maxWeek = getIsoWeeksInYear(selectedYear);

        if (!Number.isInteger(week) || week < 1 || week > maxWeek) {
            return;
        }

        setFilters((previous) => ({
            ...previous,
            week,
        }));
    };

    const handleTopSongsBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const value = Number(event.currentTarget.value);

        if (!Number.isFinite(value)) {
            event.currentTarget.value = String(topSongs);
            return;
        }

        const clamped = Math.max(1, Math.min(100, Math.round(value)));

        if (clamped !== topSongs) {
            setSettings({
                general: {
                    chartsTopSongs: clamped,
                },
            });
        }
    };

    return (
        <>
            <Stack gap="xs">
                <Text fw={500} size="sm">
                    {t('page.charts.scope')}
                </Text>

                <SegmentedControl
                    data={scopeOptions}
                    onChange={(value) =>
                        setSettings({
                            general: {
                                chartsScope: value as ChartScope,
                            },
                        })
                    }
                    size="sm"
                    value={scope}
                />
            </Stack>

            <Stack gap="xs">
                <Text fw={500} size="sm">
                    {t('page.charts.period')}
                </Text>

                <SegmentedControl
                    data={periodOptions}
                    onChange={(value) =>
                        setSettings({
                            general: {
                                chartsPeriod: value as ChartPeriod,
                            },
                        })
                    }
                    size="sm"
                    value={period}
                />
            </Stack>

            <NumberInput
                defaultValue={selectedYear}
                hideControls={false}
                key={selectedYear}
                label={t('common.year')}
                onBlur={handleYearBlur}
                width={110}
            />

            {period === 'month' && (
                <Select
                    data={monthOptions}
                    label={t('datetime.monthLong')}
                    onChange={handleMonthChange}
                    value={String(selectedMonth)}
                    width={100}
                />
            )}

            {period === 'week' && (
                <Select
                    data={weekOptions}
                    label={t('datetime.weekLong')}
                    onChange={handleWeekChange}
                    value={String(selectedWeek)}
                    width={110}
                />
            )}

            <Divider orientation="vertical" />

            <NumberInput
                defaultValue={topSongs}
                key={topSongs}
                label={t('page.charts.topSongs')}
                max={100}
                min={1}
                onBlur={handleTopSongsBlur}
                width={120}
            />
        </>
    );
};

export const ChartsToolbar = () => {
    const { t } = useTranslation();
    const { rows } = useChartsContext();
    const { isRefreshing, refresh } = useChartsRefresh();

    const songIds = useMemo(() => rows.map((row) => row.id), [rows]);

    const handleAddToPlaylist = () => {
        if (!songIds.length) {
            return;
        }

        openContextModal({
            innerProps: {
                songId: songIds,
            },
            modal: 'addToPlaylist',
            size: 'md',
            title: t('page.charts.addToPlaylist'),
        });
    };

    return (
        <FilterBar>
            <Flex justify="space-between">
                <Group gap="sm" w="100%">
                    <ChartsFilters />

                    <RefreshButton loading={isRefreshing} onClick={refresh} />
                </Group>

                <Group gap="sm" wrap="nowrap">
                    <Button
                        disabled={!songIds.length}
                        onClick={handleAddToPlaylist}
                        variant="default"
                    >
                        {t('page.charts.addToPlaylist')}
                    </Button>
                </Group>
            </Flex>
        </FilterBar>
    );
};
