module.exports = {
  "env": {
    "node": true,
    "es2021": true
  },
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "prettier/prettier": "error",
    "no-var": "error",
    "semi": "error",
    "no-multi-spaces": "error",
    "space-in-parens": "error",
    "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
    "prefer-const": "error",
    "quotes": [2, "single", { "avoidEscape": true }],
    "object-curly-spacing": [2, "always"],
    "brace-style": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "space-before-blocks": [
      2,
      { "functions": "always", "keywords": "always", "classes": "always" }
    ],
    "comma-spacing": [2, { "before": false, "after": true }],
    "keyword-spacing": ["error", { "after": true, "before": true }],
    "key-spacing": [
      2,
      {
        "singleLine": {
          "beforeColon": false,
          "afterColon": true
        },
        "multiLine": {
          "beforeColon": false,
          "afterColon": true
        }
      }
    ],
    "space-infix-ops": ["error", { "int32Hint": false }]
  }
}