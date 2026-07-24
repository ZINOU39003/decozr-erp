// Script to dump mock data into a JSON file for the backend seed
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Using dynamic import or commonjs require if needed, but since we'll run this with ts-node/esm or vite-node
import * as mockDatabase from './src/data/mockDatabase';

async function main() {
  const data = {
    customers: mockDatabase.mockCustomers,
    suppliers: mockDatabase.mockSuppliers,
    materials: mockDatabase.mockMaterials,
    designs: mockDatabase.mockDesigns,
    machines: mockDatabase.mockMachines,
    employees: mockDatabase.mockEmployees,
    orders: mockDatabase.mockOrders,
  };

  const outPath = path.resolve(__dirname, '../backend/prisma/seed-data.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Mock data successfully dumped to ${outPath}`);
}

main().catch(console.error);
