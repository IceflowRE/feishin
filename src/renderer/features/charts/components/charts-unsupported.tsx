import { useTranslation } from 'react-i18next';

import { PageHeader } from '/@/renderer/components/page-header/page-header';
import { ChartsUnsupportedReason } from '/@/renderer/features/charts/hooks/use-charts-support';
import { LibraryHeaderBar } from '/@/renderer/features/shared/components/library-header-bar';
import { Stack } from '/@/shared/components/stack/stack';
import { Text } from '/@/shared/components/text/text';

export const ChartsUnsupported = ({ reason }: { reason: ChartsUnsupportedReason }) => {
    const { t } = useTranslation();

    return (
        <Stack gap={0}>
            <PageHeader>
                <LibraryHeaderBar ignoreMaxWidth>
                    <LibraryHeaderBar.Title>{t('page.charts.title')}</LibraryHeaderBar.Title>
                </LibraryHeaderBar>
            </PageHeader>

            <Stack align="center" gap="xs" p="xl">
                <Text fw={500}>
                    {reason === 'notNavidrome'
                        ? t('page.charts.unsupportedServer')
                        : t('page.charts.unsupportedFeature')}
                </Text>
            </Stack>
        </Stack>
    );
};
