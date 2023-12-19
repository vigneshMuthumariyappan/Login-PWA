/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    register: true,
    skipWaiting: true,
    scope: '/'
});


module.exports = withPWA({
    env: {
        customerToken: 'https://api.escuelajs.co/api/v1/auth/login',
        userDetail: 'https://api.escuelajs.co/api/v1/auth/profile',
        users: 'https://api.escuelajs.co/api/v1/users'
     }
}); 