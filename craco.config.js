// craco.config.js
const webpack = require("webpack");
const path = require("path");

module.exports = {
  webpack: {
    configure: (config) => {
      //
      // 1) Stub out Express & common server‐only packages
      //
      config.resolve.alias = {
        ...config.resolve.alias,

        // Express + common middleware are replaced with empty modules:
        express:              false,
        "body-parser":        false,
        "express-ws":         false,
        "on-finished":        false,
        "raw-body":           false,
        "serve-static":       false,
        send:                 false,
        "content-disposition": false,
        etag:                 false,
        "parseurl":           false,

        // 2) Alias tiny-secp256k1 → our browser shim
        "tiny-secp256k1":   path.resolve(__dirname, "src/shims/tiny-secp256k1.js"),

        // 3) Alias bip32 → our browser shim
        bip32:              path.resolve(__dirname, "src/shims/bip32.js"),
      };

      //
      // 4) Fallback polyfills for all Node core modules used by jadets (and its dependencies)
      //
      config.resolve.fallback = {
        ...config.resolve.fallback,

        /* Browser shims */
        buffer:        require.resolve("buffer/"),            // “import { Buffer } from 'buffer'”
        crypto:        require.resolve("crypto-browserify"),   // “import crypto from 'crypto'”
        stream:        require.resolve("stream-browserify"),   // “import { Readable } from 'stream'”
        http:          require.resolve("stream-http"),         // “import http from 'http'”
        https:         require.resolve("https-browserify"),    // “import https from 'https'”
        url:           require.resolve("url/"),                // “import { parse } from 'url'”
        path:          require.resolve("path-browserify"),     // “import path from 'path'”
        querystring:   require.resolve("querystring-es3"),     // “import querystring from 'querystring'”
        zlib:          require.resolve("browserify-zlib"),     // “import zlib from 'zlib'”
        net:           require.resolve("net-browserify"),      // “import net from 'net'”
        util:          require.resolve("util/"),               // “import { promisify } from 'util'”
        assert:        require.resolve("assert/"),             // “import assert from 'assert'”
        vm:            require.resolve("vm-browserify"),       // “import vm from 'vm'”

        /* Stub out modules that have no browser equivalent */
        fs:            false,
        child_process: false,
        os:            false,
        tls:           false,
        dns:           false,
        dgram:         false,
        tty:           false,
        cluster:       false,
        module:        false,
        async_hooks:   false,
      };

      //
      // 5) ProvidePlugin: auto‐inject Buffer + process for any module that uses them
      //
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer:  ["buffer", "Buffer"],
          process: "process/browser",
        })
      );

      return config;
    },
  },
};

