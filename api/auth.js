const BASE_URL = "https://rustblog-ivory.vercel.app";

export default async (req, res) => {
  const { code, provider } = req.query;

  // Step 1: No code yet — redirect to GitHub OAuth
  if (!code) {
    const redirect =
      "https://github.com/login/oauth/authorize?" +
      `client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&redirect_uri=${BASE_URL}/api/auth` +
      `&scope=repo,user` +
      `&provider=${provider || "github"}`;
    res.writeHead(302, { Location: redirect });
    res.end();
    return;
  }

  // Step 2: Have code — exchange for access token
  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const data = await tokenRes.json();

  if (data.error) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: data.error_description || data.error }));
    return;
  }

  // Step 3: Send token back to Decap CMS popup via postMessage
  const html = `<!DOCTYPE html>
<html>
<head><title>Authenticated</title></head>
<body>
<script>
(function() {
  function receiveMessage(message) {
    var payload = JSON.stringify({ token: "${data.access_token}", scope: "${data.scope || 'repo,user'}" });
    window.opener.postMessage(
      "authorization:github:success:" + payload,
      message.origin
    );
    window.close();
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
<\/script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
};
