module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    // Desligada até a remoção dos `any` existentes (fase de legibilidade); depois volta a "error".
    "@typescript-eslint/no-explicit-any": "off",
  },
  overrides: [
    // Arquivo de configuração de rotas: exporta o router junto com o layout.
    { files: ["src/router/index.tsx"], rules: { "react-refresh/only-export-components": "off" } },
  ],
};
