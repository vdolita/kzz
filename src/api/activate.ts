import axios from 'axios';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { timer } from 'rxjs/internal/observable/timer';
// import { isDev } from '../utils/app';

async function activate(licenseKey: string) {
    // if (isDev()) {
    // eslint-disable-next-line no-constant-condition
    if (true) {
        await firstValueFrom(timer(3000));
        return true;
    }

    const response = await axios.post('https://api.licensezero.com/activate', {
        licenseKey,
    });

    if (response.status === 200) {
        return true;
    }

    return false;
}

export default activate;
