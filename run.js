const { Octokit } = require("@octokit/rest");
const { execSync } = require("child_process");

const octokit = new Octokit({ auth: "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" });
const GH = { owner: "ryyn08", repo: "serverrin2", path: "server.json" };

async function run() {
    console.clear();
    console.log("=== SISTEM MONITORING AKTIF ===");
    
    let servers = [
        {id: 1, name: "Canada", ip: "98.142.250.14"},
        {id: 2, name: "Singapore", ip: "98.142.250.14"},
        {id: 3, name: "USA, Los Angeles", ip: "98.142.250.14"},
        {id: 4, name: "India, Hyderabad", ip: "172.67.162.58"}
    ];

    for (let s of servers) {
        try {
            // Ping (Linux style)
            const output = execSync(`ping -c 1 ${s.ip}`).toString();
            const ms = parseInt(output.split("time=")[1].split(" ")[0]);
            s.ms = ms;
            s.status = ms > 150 ? "offline" : "online";
        } catch {
            s.ms = 999; s.status = "offline";
        }
        console.log(`[${s.status.toUpperCase()}] ${s.name}: ${s.ms}ms`);
    }

    // Push ke GitHub
    const { data: file } = await octokit.repos.getContent(GH);
    await octokit.repos.createOrUpdateFileContents({
        ...GH, message: "Auto Update",
        content: Buffer.from(JSON.stringify(servers)).toString('base64'),
        sha: file.sha
    });
    console.log("=== DATA DISYNC KE GITHUB ===");
}

setInterval(run, 120000); // Jalan setiap 2 menit
run();
