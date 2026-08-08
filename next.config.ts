import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  // Fixa a raiz do projeto explicitamente -- sem isso o Next tenta inferir
  // a raiz do workspace subindo diretórios, e nesta máquina ele acaba
  // escaneando o disco C:\ inteiro (visto nos logs do dev server: tenta
  // ler DumpStack.log.tmp, hiberfil.sys etc.), o que corrompe o cache do
  // webpack em modo dev de tempos em tempos ("__webpack_modules__[moduleId]
  // is not a function").
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
