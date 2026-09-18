import type { NextConfig } from 'next';
const config: NextConfig = {
  serverExternalPackages: ['exceljs'],
  outputFileTracingIncludes: { '/*': ['./data/*.xlsx'] },
};
export default config;
