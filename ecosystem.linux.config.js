module.exports = {
    apps: [
        {
            name: "frontend-test-prod",
            cwd: "/home/kishan-pandey/Downloads/project_source (2)",
            script: "npm",
            args: "start",
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: 3005
            }
        },
        {
            name: "tunnel-test",
            script: "cloudflared",
            args: "tunnel run test-bijliwala",
            cwd: "/home/kishan-pandey/Downloads/project_source (2)"
        }
    ]
};
