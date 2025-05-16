// eslint.config.js
export default [
  {
    files: ["**/*.js"],
    ignores: ["package-lock.json", "node_modules/**", "dist/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // example: 'no-unused-vars': 'warn'
    },
  },
];
