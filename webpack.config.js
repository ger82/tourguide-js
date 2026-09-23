const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = require('crypto');
}

/**
 * Creates a webpack configuration for either the minified production
 * bundle or an unminified, readable debug bundle.
 *
 * @param {boolean} minify - Whether to produce a minified (production) build
 */
function createConfig(minify) {
    return {
        mode: 'production',
        entry: './src/Tour.ts',
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                api: 'modern-compiler',
                                implementation: require('sass'),
                                sassOptions: {
                                    // FIX: explicitly control Sass's own
                                    // output formatting so the difference
                                    // between the minified and dev builds
                                    // is guaranteed - regardless of the
                                    // Sass compiler's own default style.
                                    style: minify ? 'compressed' : 'expanded',
                                },
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: minify ? 'css/tour.min.css' : 'css/tour.css',
            }),
        ],
        optimization: {
            minimize: minify,
            minimizer: minify
                ? [
                    '...',
                    new CssMinimizerPlugin(),
                ]
                : [],
        },
        output: {
            library: {
                name: 'tourguide',
                type: 'umd',
            },
            publicPath: '',
            filename: minify ? 'tour.js' : 'tour.dev.js',
            path: path.resolve(__dirname, 'dist'),
        },
    };
}

module.exports = [
    createConfig(true),
    createConfig(false),
];
