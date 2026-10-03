import { useCurrentServerWithCredential } from '/@/renderer/store';
import { hasFeature } from '/@/shared/api/utils';
import { ServerType } from '/@/shared/types/domain-types';
import { ServerFeature } from '/@/shared/types/features-types';

export type ChartsUnsupportedReason = 'featureMissing' | 'notNavidrome';

export const useChartsSupport = (): {
    isSupported: boolean;
    reason: ChartsUnsupportedReason | null;
} => {
    const server = useCurrentServerWithCredential();

    if (server && server.type !== ServerType.NAVIDROME) {
        return { isSupported: false, reason: 'notNavidrome' };
    }

    if (!hasFeature(server, ServerFeature.CHARTS)) {
        return { isSupported: false, reason: 'featureMissing' };
    }

    return { isSupported: true, reason: null };
};
