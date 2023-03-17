declare const APP_ENV: string;

export function getAppEnv() {
    console.log(APP_ENV);
    return APP_ENV;
}

export function isDev() {
    return getAppEnv() === 'development';
}

export function isProd() {
    return getAppEnv() === 'production';
}