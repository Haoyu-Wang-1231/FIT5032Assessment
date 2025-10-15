const { google } = require("googleapis");
const readline = require("readline");

// CommonJS file (e.g., getRefreshCode.js)
const http = require("http");

// helper for ESM-only 'open'
async function openUrl(url) {
  const { default: open } = await import('open');
  await open(url);
}

// ... your OAuth setup above ...

const CLIENT_ID = "265542789915-umdidberssc3gtc9r97rd57iqt1q7j3e.apps.googleusercontent.com";
const CLIENT_SECRET = "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";

// Use localhost redirect (recommended)  OOB is deprecated
const REDIRECT_URI = "http://127.0.0.1:51789/callback"; // any free local port

async function main() {
  const oAuth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

  const authUrl = oAuth2.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  // tiny local server to capture the code
  const http = require("http");
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith("/callback")) {
      const url = new URL(req.url, `http://127.0.0.1:51789`);
      const code = url.searchParams.get("code");
      try {
        const { tokens } = await oAuth2.getToken(code);
        res.end("Refresh token captured. You can close this tab.");
        console.log("\nYour REFRESH TOKEN:\n", tokens.refresh_token);
      } catch (e) {
        res.statusCode = 500;
        res.end("Error exchanging code. Check console.");
        console.error(e);
      } finally {
        server.close();
      }
    } else {
      res.statusCode = 404;
      res.end("Not found");
    }
  });
  server.listen(51789, "127.0.0.1", () => {
    console.log("Visit this URL to authorize:\n", authUrl);
    openUrl(authUrl);
  });
}


main();