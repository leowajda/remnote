export default {
  extends: ["stylelint-config-standard"],
  referenceFiles: ["src/tokens.css", "src/remnote.css"],
  overrides: [{ files: ["src/tokens.css"], rules: { "color-no-hex": null } }],
  rules: {
    "declaration-no-important": true,
    "no-unknown-custom-properties": true,
    "function-disallowed-list": [
      "/^(repeating-)?(linear|radial|conic)-gradient$/",
    ],
    "selector-max-specificity": "0,4,1",
    "selector-max-id": 0,
    "color-no-hex": true,
    "custom-property-pattern":
      "^(cosmic|rn)-[a-z0-9-]+$|^(current-background-color|tw-bg-opacity-highlight|beautiful-queue-(box-bg|mobile-back-stack-card-bg|mobile-surface-border)|bg-(cyan|mint|orange|purple|red|yellow)-20|highlight-color-(blue|green|orange|purple|red|yellow))$",
    "selector-class-pattern": null,
    "no-descending-specificity": true,
    "declaration-property-value-no-unknown": true,
  },
};
