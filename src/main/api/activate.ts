import { appName, devHost, host } from '.';
import { isDev } from '../../utils/app';

import axios from 'axios';
import { License } from '../../model/license';

async function activate(licenseKey: string): Promise<License | null> {
    const queryHost = isDev() ? devHost : host;

    try {
        const response = await axios.post<License>(`${queryHost}/activate`, {
            licenseKey,
            app: appName,
        });

        if (response.status === 200) {
            return response.data;
        }

        return null;
    } catch (e) {
        return null;
    }
}

export default activate;
