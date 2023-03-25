import axios from 'axios';
import { devHost, host, appName } from '.';
import { License } from '../../model/license';
import { isDev } from '../../utils/app';

interface verifyResponse {
    data: Array<License>;
}

async function verifyLicense(licenses: Array<License>): Promise<Array<License> | null> {
    const queryHost = isDev() ? devHost : host;

    try {
        const response = await axios.post<verifyResponse>(`${queryHost}/verification`, {
            licenses: licenses.map((license) => ({ ...license, app: appName })),
        });

        if (response.status === 200) {
            return response.data.data;
        }

        return null;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export default verifyLicense;
