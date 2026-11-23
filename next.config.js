/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:asset*.glb",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
