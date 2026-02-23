module.exports = {
    apps: [
        {
            name: "test-bijliwala-app",
            script: "npm",
            args: "run dev-watch",
            cwd: "/home/kishan-pandey/Downloads/project_source (2)",
            env: {
                NODE_ENV: "production",
                PORT: 3005
            }
        },
        {
            name: "test-bijliwala-tunnel",
            script: "cloudflared",
            args: "tunnel run test-bijliwala",
            cwd: "/home/kishan-pandey/Downloads/project_source (2)"
        }
    ]
}
