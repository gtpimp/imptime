var path = require('path')
var webpack = require('webpack')

module.exports = {
    entry: [
        './index_react'
    ],
    output: {
        filename: 'imptime.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel'],
                exclude: /node_modules/,
                include: __dirname
            }
        ]
    }
}
