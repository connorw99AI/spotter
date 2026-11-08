// Minimal Node typings for the authoring scripts (the app itself is browser-only).
declare module 'node:fs' {
  export function appendFileSync(path: string, data: string): void;
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function writeFileSync(path: string, data: string): void;
  export function readdirSync(path: string): string[];
  export function existsSync(path: string): boolean;
}
