const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Update datasource provider to postgresql
schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');

// Split schema by lines
const lines = schema.split('\n');
const newLines = [];

let inModel = false;
let modelName = '';
const standardFields = [
  '  tenantId        String?',
  '  createdBy       String?',
  '  updatedBy       String?',
  '  deletedAt       DateTime?'
];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.startsWith('model ')) {
    inModel = true;
    modelName = line.split(' ')[1];
    newLines.push(line);
    continue;
  }
  
  if (inModel && line === '}') {
    // Before closing the model, we ensure standard fields exist if they don't already
    // Check if fields exist in the model block
    let modelBlock = '';
    for (let j = newLines.length - 1; j >= 0; j--) {
      modelBlock = newLines[j] + '\n' + modelBlock;
      if (newLines[j].startsWith('model ')) break;
    }
    
    // Some join tables like UserRole, RolePermission might use composite keys like @@id([user_id, role_id])
    // We only add standard fields if it's a typical model, not a simple join table if it doesn't have an id
    // Actually, the user said "Every model must have...". Let's check if it has `id `
    if (modelBlock.includes('id ') || modelBlock.includes('id\t') || modelBlock.includes('@id')) {
      // Add createdAt, updatedAt if missing
      if (!modelBlock.includes('created_at') && !modelBlock.includes('createdAt')) {
        newLines.push('  createdAt       DateTime  @default(now())');
      }
      if (!modelBlock.includes('updated_at') && !modelBlock.includes('updatedAt')) {
        newLines.push('  updatedAt       DateTime  @updatedAt');
      }
      
      // Add other standard fields if missing
      if (!modelBlock.includes('tenantId')) newLines.push(standardFields[0]);
      if (!modelBlock.includes('createdBy')) newLines.push(standardFields[1]);
      if (!modelBlock.includes('updatedBy')) newLines.push(standardFields[2]);
      if (!modelBlock.includes('deleted_at') && !modelBlock.includes('deletedAt')) newLines.push(standardFields[3]);
    }
    
    newLines.push(line);
    inModel = false;
    continue;
  }
  
  newLines.push(line);
}

fs.writeFileSync(schemaPath, newLines.join('\n'), 'utf8');
console.log('Schema updated successfully!');
