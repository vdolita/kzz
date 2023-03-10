/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import type { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import commonConfig from './webpack.common.config';
import rules from './webpack.rules';

const mainConfig: Configuration = {
    ...commonConfig,
    entry: {
        main: './src/index.ts',
    },
    target: 'electron-main',
    module: {
        rules: [{
            // We're specifying native_modules in the test because the asset relocator loader generates a
            // "fake" .node file which is really a cjs file.
            test: /native_modules[/\\].+\.node$/,
            use: 'node-loader',
        },
        {
            test: /\.(m?js|node)$/,
            parser: { amd: false },
            use: {
                loader: '@vercel/webpack-asset-relocator-loader',
                options: {
                    outputAssetBase: 'native_modules',
                },
            },
        },
        ...rules,
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
    ],
    devServer: {
        static: './dist'
    },
}

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

export default [mainConfig, rendererConfig, preloadConfig];