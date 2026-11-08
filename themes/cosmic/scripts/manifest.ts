import { Ajv } from "ajv";
export interface Manifest {
  id: string;
  version: { major: number; minor: number; patch: number };
  [key: string]: unknown;
}
const validate = new Ajv({ allErrors: true }).compile({
  type: "object",
  required: [
    "manifestVersion",
    "id",
    "name",
    "author",
    "repoUrl",
    "version",
    "theme",
    "enableOnMobile",
    "requestNative",
    "requiredScopes",
  ],
  properties: {
    manifestVersion: { const: 1 },
    id: { const: "cosmic-dark" },
    name: { type: "string", minLength: 1 },
    author: { type: "string", minLength: 1 },
    repoUrl: { type: "string", pattern: "^https://" },
    version: {
      type: "object",
      required: ["major", "minor", "patch"],
      additionalProperties: false,
      properties: {
        major: { type: "integer", minimum: 0 },
        minor: { type: "integer", minimum: 0 },
        patch: { type: "integer", minimum: 0 },
      },
    },
    theme: { const: ["light", "dark"] },
    enableOnMobile: { const: true },
    requestNative: { const: false },
    requiredScopes: { type: "array", maxItems: 0 },
  },
});
export function assertManifest(input: unknown): asserts input is Manifest {
  if (!validate(input)) throw new Error(JSON.stringify(validate.errors));
}
