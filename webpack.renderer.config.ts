import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
    test: /\.css$/,
    use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: [
                        [
                            'postcss-import',
                            {
                                // Options
                            },
                        ],
                        [
                            'tailwindcss/nesting',
                            {
                                // Options
                            },
                        ],
                        [
                            'tailwindcss',
                            {
                                // Options
                            },
                        ],
                        [
                            'postcss-preset-env',
                            {
                                features: { 'nesting-rules': false },
                            },
                        ],
                        [
                            'autoprefixer',
                            {
                                // Options
                            },
                        ],
                    ],
                },
            },
        },
    ],
});

export function rendererConfig(): Configuration {
    const isProd = process.env.NODE_ENV === 'production';
    const pgs = [...plugins];

    if (!isProd) {
        pgs.pop();
    }

    if (isProd) {
        // remove bundle analyzer plugin
        pgs.splice(1, 1);
    }

    return {
        module: {
            rules,
        },
        plugins: pgs,
        resolve: {
            extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
        },
    };
}
