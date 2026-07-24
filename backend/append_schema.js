const fs = require('fs');
const extra = `
model Supplier {
  id          String   @id @default(uuid())
  name_ar     String
  phone       String?
  category    String?
  is_active   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tenantId    String?
  createdBy   String?
  updatedBy   String?
  deletedAt   DateTime?
}

model Invoice {
  id             String   @id @default(uuid())
  invoice_number String   @unique
  order_id       String
  total_amount   Float
  status         String   @default("unpaid")
  issue_date     DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  tenantId       String?
  createdBy      String?
  updatedBy      String?
  deletedAt      DateTime?

  order    Order     @relation(fields: [order_id], references: [id])
  payments Payment[]
}

model Employee {
  id              String   @id @default(uuid())
  full_name_ar    String
  employee_number String   @unique
  position        String?
  is_active       Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  tenantId        String?
  createdBy       String?
  updatedBy       String?
  deletedAt       DateTime?
}
`;
fs.appendFileSync('prisma/schema.prisma', extra, 'utf8');
