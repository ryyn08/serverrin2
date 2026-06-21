const { Octokit } = require("@octokit/rest");
const { execSync } = require("child_process");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const GH = { owner: "ryyn08", repo: "serverrin2", path: "server.json" };

async function run() {
    let servers = [
        {id: 1, name: "Canada", ip: "98.142.250.14"},
        {id: 2, name: "Singapore", ip: "98.142.250.14"},
        {id: 3, name: "USA, Los Angeles", ip: "98.142.250.14"},
        {id: 4, name: "India, Hyderabad", ip: "172.67.162.58"}
    ];

    console.log("--- SCANNING SERVERS ---");
    for (let s of servers) {
        try {
            const out = execSync(`ping -c 1 ${s.ip}`).toString();
            s.ms = parseInt(out.split("time=")[1].split(" ")[0]);
            s.status = s.ms > 150 ? "offline" : "online";
        } catch { s.ms = 999; s.status = "offline"; }
        console.log(`[${s.status.toUpperCase()}] ${s.name} : ${s.ms}ms`);
    }

    const { data: file } = await octokit.repos.getContent(GH);
    await octokit.repos.createOrUpdateFileContents({
        ...GH, message: "Auto Update",
        content: Buffer.from(JSON.stringify(servers)).toString('base64'),
        sha: file.sha
    });
    console.log("--- SYNCED TO GITHUB ---");
}

setInterval(run, 120000); run();
