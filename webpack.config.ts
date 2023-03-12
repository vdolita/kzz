/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import type { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import commonConfig from './webpack.common.config';
import rules from './webpack.rules';
import path from 'path';

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
        static: './dist',
        hot: true,
        devMiddleware: {
            writeToDisk: true,
        },
        historyApiFallback: true,
        headers: {
            'Content-Security-Policy': "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:",
        },
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

export default [toolBarConfig, mainConfig, rendererConfig, preloadConfig];