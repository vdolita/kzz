import path from 'path';
import type { Configuration } from 'webpack';


const commonConfig: Configuration = {
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: false,
    },
    watchOptions: {
        ignored: ['**/node_modules', '**/dist', '**/out'],
    },
    optimization: {
        // runtimeChunk: 'single',
    },
};

export default commonConfig;