module.exports = {
  presets: [
    [
      "taro",
      {
        framework: "vue3",
        ts: true,
        compiler: "webpack5",
        useBuiltIns: "entry",
      },
    ],
  ],
  plugins: ["@babel/plugin-transform-class-static-block"],
};
