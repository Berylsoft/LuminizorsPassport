import NutUIResolver from "@nutui/auto-import-resolver";
import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import ComponentsPlugin from "unplugin-vue-components/vite";
import { searchForWorkspaceRoot } from "vite";
import TSConfigPathPlugin from "vite-tsconfig-paths";

import devConfig from "./dev";
import prodConfig from "./prod";

export default defineConfig<"vite">((merge) => {
  const baseConfig: UserConfigExport<"vite"> = {
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
      [
        "@tarojs/plugin-html",
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
      type: "vite",
      vitePlugins: [
        ComponentsPlugin({
          resolvers: [NutUIResolver({ taro: true, importStyle: "sass" })],
        }),
        TSConfigPathPlugin(),
      ],
    },
    sass: {
      data: '@use "@nutui/nutui-taro/dist/styles/variables-jdt.scss" as *;',
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
            namingPattern: "module",
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      sassLoaderOption: {
        silenceDeprecations: ["import", "legacy-js-api"],
      },
      optimizeMainPackage: {
        enable: true,
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",

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
      sassLoaderOption: {
        silenceDeprecations: ["import", "legacy-js-api"],
      },
      devServer: {
        open: false,
        fs: {
          allow: [searchForWorkspaceRoot(process.cwd())],
        },
      },
    },
  };

  if (process.env.NODE_ENV === "development") {
    return merge({}, baseConfig, devConfig);
  }
  return merge({}, baseConfig, prodConfig);
});
