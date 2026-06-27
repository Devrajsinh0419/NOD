console.log("NODE_ENV:", process.env.NODE_ENV);

console.log("AUTH0_DOMAIN exists?", !!process.env.AUTH0_DOMAIN);
console.log("AUTH0_CLIENT_ID exists?", !!process.env.AUTH0_CLIENT_ID);
console.log("AUTH0_SECRET exists?", !!process.env.AUTH0_SECRET);
console.log("AUTH0_CLIENT_SECRET exists?", !!process.env.AUTH0_CLIENT_SECRET);
console.log("APP_BASE_URL exists?", !!process.env.APP_BASE_URL);

console.log("All AUTH0 env keys:");
console.log(
  Object.keys(process.env).filter(key => key.includes("AUTH0"))
);