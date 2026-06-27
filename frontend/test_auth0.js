const client_id = "7HwexAxsopbNtt7BBV2qIWLYNOBDNkHQ";
const client_secret = "5etwsd655ecswrsc577iv4w2t54vtb787d8676i5t57cy5t76c5cre64r6ce65c3e4i7r5yted";
const domain = "dev-hwo8pt4h8aa628nc.us.auth0.com";

console.log("Testing Auth0 credentials...");
fetch(`https://${domain}/oauth/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    client_id,
    client_secret,
    audience: `https://${domain}/api/v2/`,
    grant_type: 'client_credentials'
  })
})
.then(res => res.json())
.then(data => {
  console.log("AUTH0 RESPONSE:", data);
})
.catch(err => {
  console.error("TEST ERROR:", err);
});
