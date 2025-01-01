const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/pollution', // Proxy requests starting with /pollution
        createProxyMiddleware({
            target: 'http://4.231.99.148:8000', // Your API server
            changeOrigin: true,
        })
    );
};
