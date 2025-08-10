module.exports = {
  presets: [
    [
      "taro",
      {
        framework: "vue3",
        ts: true,
        compiler: "vite",
      },
    ],
  ],
  plugins: ["@babel/plugin-transform-class-static-block"],
};
