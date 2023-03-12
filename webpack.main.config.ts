/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';

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
        new DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
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
    output: {
        ...commonConfig.output,
        clean: true
    }
}


export default mainConfig;