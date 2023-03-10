import type { ModuleOptions } from 'webpack';

export const rules: Required<ModuleOptions>['rules'] = [
    {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
    },
    {
        test: /\.jsx?$/,
        use: {
            loader: 'babel-loader',
            options: {
                exclude: /node_modules/,
                presets: ['@babel/preset-react'],
            },
        },
    }
];


export default rules;