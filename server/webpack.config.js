const path = require('path');
const generateProdPackage = require('./generateProdPackage');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'server.bundle.js',
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ]
    },
    resolve: {
        extensions: ['.js'],
    },
    externals: {
        sqlite3: 'commonjs sqlite3',
        '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
        'node-gyp': 'commonjs node-gyp',
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.done.tap('AfterEmitPlugin', () => {
                    generateProdPackage();
                });
            }
        }
    ]
};