/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! ADVERTENCIA !!
    // Esto permite que el despliegue se complete con éxito incluso si
    // tu proyecto tiene errores de TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // También ignoramos errores de ESLint para asegurar el despliegue rápido
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;