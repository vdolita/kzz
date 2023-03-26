import { Configuration, DefinePlugin } from 'webpack';
import WebpackObfuscator from 'webpack-obfuscator';

import { rules } from './webpack.rules';

export const mainConfig: Configuration = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/index.ts',
    // Put your normal webpack config below here
    module: {
        rules,
    },
    plugins: [
        new DefinePlugin({
            APP_ENV: JSON.stringify(process.env.NODE_ENV),
        }),
        new WebpackObfuscator(
            {
                rotateStringArray: true,
            },
            [],
        ),
    ],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    },
};
