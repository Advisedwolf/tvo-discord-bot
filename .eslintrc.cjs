// .eslintrc.js
export default {
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "standard"
  ],
  plugins: [
    "import",
    "node",
    "promise"
  ],
  rules: {
    // any overrides you want, e.g.
    // "no-console": "warn"
  }
};
