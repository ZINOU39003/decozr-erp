import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DesignsModule } from './designs/designs.module';
import { OrdersModule } from './orders/orders.module';
import { HealthModule } from './health/health.module';
import { MachinesModule } from './machines/machines.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { MaterialsModule } from './materials/materials.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductionModule } from './production/production.module';
import { ReportsModule } from './reports/reports.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { SettingsModule } from './settings/settings.module';
import { TasksModule } from './tasks/tasks.module';
import { EmployeesModule } from './employees/employees.module';
import { OffcutsModule } from './offcuts/offcuts.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { SeasonsModule } from './seasons/seasons.module';
import { CapacityModule } from './capacity/capacity.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { UploadsModule } from './uploads/uploads.module';
import { PortalModule } from './portal/portal.module';
import { AdminPortalModule } from './admin-portal/admin-portal.module';
import { RbacModule } from './rbac/rbac.module';

@Module({
  imports: [
    // Core
    PrismaModule,
    HealthModule,
    UploadsModule,
    // Auth & Users
    AuthModule,
    UsersModule,
    RbacModule,
    // Phase 2: Core entities
    CustomersModule,
    SuppliersModule,
    MaterialsModule,
    InventoryModule,
    // Phase 3: Heart of the ERP
    OrdersModule,
    DesignsModule,
    // Phase 4: Operations
    ProductionModule,
    MachinesModule,
    TasksModule,
    NotificationsModule,
    OffcutsModule,
    WorkflowsModule,
    SeasonsModule,
    CapacityModule,
    WorkspaceModule,
    // Phase 5: Finance
    InvoicesModule,
    PaymentsModule,
    ReportsModule,
    // Phase 6: Administration
    SettingsModule,
    EmployeesModule,
    DashboardModule,
    PortalModule,
    AdminPortalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
