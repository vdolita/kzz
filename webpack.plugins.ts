import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import WebpackObfuscator from 'webpack-obfuscator';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
    new ForkTsCheckerWebpackPlugin({
        logger: 'webpack-infrastructure',
    }),
    new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
    }),
    new WebpackObfuscator(
        {
            rotateStringArray: true,
        },
        [],
    ),
];
