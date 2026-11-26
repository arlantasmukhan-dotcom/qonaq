// Prints the host magic link for a listing slug: node scripts/host-link.cjs erlan
const { createClient } = require("@libsql/client");
const c = createClient({ url: process.env.DATABASE_URL || "file:./data/qonaq.db", authToken: process.env.DATABASE_AUTH_TOKEN });
c.execute({ sql: "select id, edit_token from listings where slug = ?", args: [process.argv[2] || "erlan"] }).then((r) => {
  const row = r.rows[0];
  if (!row) return console.error("not found");
  console.log(`${process.env.PUBLIC_BASE_URL || "http://localhost:3000"}/host/${row.id}?t=${row.edit_token}`);
});
