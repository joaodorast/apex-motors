/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endpoint opcional (POST JSON) para o formulário de contato. */
  readonly VITE_CONTACT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
