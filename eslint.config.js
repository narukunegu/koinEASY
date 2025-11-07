import antfu from "@antfu/eslint-config";

export default antfu(
  {
    vue: true,
    typescript: true,
    formatters: true,
    ignores: [
      "**/components/ui/**",
      "**/src-tauri/**",
      "**/vite-env.d.ts",
      "vite.config.ts",
      "tsconfig.json",
    ],
    stylistic: {
      indent: 2,
      quotes: "double",
      semi: true,
    },
  },
  {
    // Without `files`, they are general rules for all files
    rules: {
      "style/semi": ["off"],
      "style/operator-linebreak": ["off"],
      "style/brace-style": ["off"],
      "style/indent-binary-ops": ["off"],
      "style/arrow-parens": ["off"],
      "perfectionist/sort-imports": ["off"],
      "perfectionist/sort-named-imports": ["off"],
      "vue/operator-linebreak": ["off"],
      "vue/singleline-html-element-content-newline": ["off"],
    },
  },
);
