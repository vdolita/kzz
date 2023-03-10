import path from 'path';
import type { Configuration } from 'webpack';

import rules from './webpack.rules';

const commonConfig: Configuration = {
    mode: 'development',
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        fallback: {
            path: false,
            fs: false,
        },
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    watchOptions: {
        ignored: ['**/node_modules', '**/dist', '**/out'],
    },
    optimization: {
        runtimeChunk: 'single',
    },
};

export default commonConfig;