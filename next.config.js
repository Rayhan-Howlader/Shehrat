/** The storefront lives in public/store.html and is served at "/" */
module.exports = {
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/store.html" }] };
  },
};
