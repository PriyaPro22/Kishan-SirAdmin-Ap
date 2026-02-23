module.exports = {
    apps: [
        {
            name: "backend-api-5009",
            cwd: "D:\\backend new 13-02-2026\\backend-main\\backend-main",
            script: "node_modules/nodemon/bin/nodemon.js",
            args: "index.js",
            env: {
                PORT: 5009,
                NODE_ENV: "development"
            }
        },
        {
            name: "admin-app-3001",
            cwd: "D:\\backend new 13-02-2026\\Admin-App-4\\Admin App (4)\\Admin App",
            script: "npm",
            args: "run dev -- -p 3001",
            env: {
                PORT: 3001,
                NODE_ENV: "development"
            }
        },
        {
            name: "frontend-app-4001",
            cwd: "D:\\BIJLI WALA AYA V2 DATE 13",
            script: "npm",
            args: "run dev",
            env: {
                PORT: 4001,
                NODE_ENV: "development"
            }
        }
    ]
};
