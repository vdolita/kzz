import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            // [
            //   "postcss-import",
            //   {
            //     // Options
            //   },
            // ],
            [
              "postcss-preset-env",
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
              "tailwindcss",
              {
                // Options
              },
            ],
            [
              "autoprefixer",
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

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
