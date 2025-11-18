import { neon, neonConfig } from '@neondatabase/serverless';

// Enable fetch for Node environments if needed
// neonConfig.fetchConnectionCache = true; // keep-alive style reuse

let sql: ReturnType<typeof neon> | null = null;

function getSqlClient() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    // Ensure the connection string is properly formatted for Neon
    const cleanUrl = databaseUrl.replace(/[?&]sslmode=require[&]?/g, '?').replace(/[?&]channel_binding=require[&]?/g, '?').replace(/\?$/g, '');
    
    sql = neon(cleanUrl);
  }
  
  return sql;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const client = getSqlClient();
    const rows = await client`select 1 as ok`;
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

export async function getVehicleCount(): Promise<number> {
  try {
    const client = getSqlClient();
    const rows = await client`select count(*)::int as count from "Vehicle"`;
    return (rows as any)?.[0]?.count ?? 0;
  } catch {
    return 0;
  }
}


