/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ATHAR_V2?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
