/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SMART_CONTRACT_PACKAGE_ID: string;
  readonly VITE_DAO_LIST_ID: string;
  readonly VITE_DAO_CAP_TYPE: string;
  readonly VITE_ADMIN_CAP_TYPE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
