/* eslint-disable */
const withLess = require('@zeit/next-less');
// const lessToJS = require('less-vars-to-js');
const fs = require('fs');
const path = require('path');
const { getThemeVariables } = require('antd/dist/theme');

// Where your antd-custom.less file lives
const themeVariables = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, './assets/antd-custom.json'),
        'utf8'
    )
);

// console.log({
//     ...getThemeVariables({ dark: true, compact: true }),
//     ...themeVariables,
// });

module.exports = withLess({
    lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: {
            ...getThemeVariables({ dark: true, compact: true }),
            ...themeVariables,
        },
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            const antStyles = /antd\/.*?\/style.*?/;
            const origExternals = [...config.externals];
            config.externals = [
                (context, request, callback) => {
                    if (request.match(antStyles)) return callback();
                    if (typeof origExternals[0] === 'function') {
                        origExternals[0](context, request, callback);
                    } else {
                        callback();
                    }
                },
                ...(typeof origExternals[0] === 'function'
                    ? []
                    : origExternals),
            ];

            config.module.rules.unshift({
                test: antStyles,
                use: 'null-loader',
            });
        }
        return config;
    },
});
