declare const APP_ENV: string;

export function getAppEnv() {
    return APP_ENV;
}

export function isDev() {
    return getAppEnv() === 'development';
}

export function isProd() {
    return getAppEnv() === 'production';
}