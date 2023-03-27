import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
    packagerConfig: {
        icon: './images/icon',
        name: 'LiveOrderBoost',
        appBundleId: 'com.vdolita.liveorderboost',
        appCopyright: '© 2021 Vdolita',
        appVersion: '1.0.0',
        asar: true,
    },
    rebuildConfig: {},
    // makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({}), new PortableMaker({})],
    makers: [
        new MakerSquirrel({
            setupIcon: './images/icon.ico',
            iconUrl: 'https://duck.vdolita.com/icon.ico',
            name: 'LiveOrderBoost',
            copyright: '© 2021 Vdolita',
        }),
        new MakerZIP({}, ['darwin']),
    ],
    plugins: [
        new WebpackPlugin({
            mainConfig: mainConfig(),
            devServer: {
                host: 'localhost',
            },
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: './src/index.html',
                        js: './src/renderer.ts',
                        name: 'main_window',
                        preload: {
                            js: './src/preload.ts',
                        },
                    },
                    {
                        js: './src/tool-bar/index.ts',
                        name: 'tool',
                    },
                ],
            },
        }),
    ],
};

export default config;
