/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import { Configuration } from 'webpack';

import commonConfig from './webpack.common.config';
import rules from './webpack.rules';
import path from 'path';
import mainConfig from './webpack.main.config';

const rendererConfig: Configuration = {
    ...commonConfig,
    entry: {
        renderer: './src/renderer.ts',
    },
    target: 'electron-renderer',
    module: {
        rules: [
            ...rules,
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },
    output: {
        ...commonConfig.output,
    },
};

const preloadConfig: Configuration = {
    ...commonConfig,
    entry: {
        preload: './src/preload.ts',
    },
    target: 'electron-preload',
    module: {
        rules,
    },
}

const toolBarConfig: Configuration = {
    ...commonConfig,
    entry: {
        toolbar: './src/tool-bar/index.ts',
    },
    target: 'web',
    module: {
        rules: [
            ...rules,
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ]
    },
    output: {
        ...commonConfig.output,
        path: path.resolve(__dirname, 'dist', 'tool-bar'),
        library: {
            type: 'umd',
            name: 'KzzTB',
        },
    },
}

export default [mainConfig, rendererConfig, preloadConfig, toolBarConfig];