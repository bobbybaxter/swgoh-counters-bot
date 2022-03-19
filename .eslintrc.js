module.exports = {
  parserOptions: {
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  env: {
    node: true,
    commonjs: true,
    es2020: true
  },
  extends: [
    "eslint:recommended"
  ],
  globals: {
    "document": true,
    "window": true,
    "allowTemplateLiterals": true
  },
  settings: {
    "import/resolver": {
      "node": {
        "paths": [
          "./"
        ]
      }
    }
  },
  reportUnusedDisableDirectives: true,
  root: true,
  rules: {
    "no-console": [
      1,
      {
        "allow": [
          "error",
          "info",
          "log"
        ]
      }
    ],
    "no-debugger": 1,
    "class-methods-use-this": 0,
    "linebreak-style": 0,
    "global-require": 0,
    "one-var": 0,
    "one-var-declaration-per-line": 0,
    'arrow-parens': [ 1, 'as-needed' ],
    'object-curly-spacing': [ 1, 'always' ],
    'array-bracket-spacing': [ 1, 'always' ],
    'space-in-parens': [ 1, 'always', { exceptions: [ "()" ] } ],
    'template-curly-spacing': [ 1, 'always' ],
    'computed-property-spacing': [ 1, 'always' ],
    'semi': [ 1, 'always' ],
    'object-shorthand': [ 1, 'always' ],
    "indent": [ 1, 2 ],
    "no-unused-vars": [ 1, { "args": "none" } ]
  }
};