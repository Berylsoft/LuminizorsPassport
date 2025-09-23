import NutUIResolver from "@nutui/auto-import-resolver";
import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import path from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import ComponentsPlugin from "unplugin-vue-components/webpack";

import devConfig from "./dev";
import prodConfig from "./prod";

export default defineConfig((merge) => {
  const baseConfig: UserConfigExport = {
    projectName: "LuminizorsPassport",
    date: "2025-5-30",
    designWidth(input) {
      if (
        typeof input === "object" &&
        typeof input.file === "string" &&
        input.file.replace(/\\+/g, "/").indexOf("@nutui") > -1
      ) {
        return 375;
      }
      return 750;
    },
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: "dist",
    plugins: [
      "@tarojs/plugin-html",
      [
        "@tarojs/plugin-http",
        {
          enableCookie: true,
          disabledBlob: false,
        },
      ],
      [
        "@tarojs/plugin-framework-vue3",
        {
          vueLoaderOption: {
            compilerOptions: {
              // use uppercase to avoid transformation of Taro
              isCustomElement: (tag: string) => tag === "INPUT",
            },
          },
        },
      ],
    ],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: "vue3",
    compiler: {
      type: "webpack5",
      prebundle: {
        enable: false,
        force: true,
        exclude: ["@nutui/nutui-taro", "@nutui/icons-vue-taro"],
      },
    },
    cache: {
      enable: false,
    },
    sass: {
      data: '@import "@nutui/nutui-taro/dist/styles/variables-jdt.scss";',
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: "global",
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      compile: {
        include: [path.resolve(__dirname, "../luminizors.config.ts")],
      },
      sassLoaderOption: {
        sassOptions: {
          silenceDeprecations: ["import", "legacy-js-api"],
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
        chain.plugin("unplugin-vue-components").use(
          ComponentsPlugin({
            resolvers: [NutUIResolver({ taro: true })],
          }),
        );
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
      },
      optimizeMainPackage: {
        enable: true,
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",
      output: {
        filename: "js/[name].[hash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].js",
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: "css/[name].[hash].css",
        chunkFilename: "css/[name].[chunkhash].css",
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: "module",
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      compile: {
        include: [path.resolve(__dirname, "../luminizors.config.ts")],
      },
      sassLoaderOption: {
        sassOptions: {
          silenceDeprecations: ["import", "legacy-js-api"],
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
        chain.plugin("unplugin-vue-components").use(
          ComponentsPlugin({
            resolvers: [NutUIResolver({ taro: true })],
          }),
        );
      },
    },
  };

  if (process.env.NODE_ENV === "development") {
    return merge({}, baseConfig, devConfig);
  }
  return merge({}, baseConfig, prodConfig);
});
