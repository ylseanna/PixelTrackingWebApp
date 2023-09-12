/** @type {import('next').NextConfig} */

const basePath = process.env.NEXT_PUBLIC_APP_BASE_PATH;
const defaultLocale = 'en';

module.exports = {
  reactStrictMode: false,
  output: 'standalone',
  basePath: basePath,
  // Redirect basePath to path with locale due to next-intl not supporting basePath
  async redirects() {
    return ([
      {
        source: basePath,
        destination: `${basePath}/${defaultLocale}`,
        permanent: true,
        basePath: false,
      },
    ]);
  }
}
