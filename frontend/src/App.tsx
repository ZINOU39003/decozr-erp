import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './core/api/queryClient';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import './App.css';
import { ErpLayout } from './components/layout/ErpLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { CommandPalette } from './components/shared/CommandPalette';

import { DesignsCatalog } from './pages/designs/DesignsCatalog';
import { DesignEditor } from './pages/designs/DesignEditor';
import { VersionsManager } from './pages/designs/VersionsManager';
import { CustomizationEditor } from './pages/designs/CustomizationEditor';
import { BomEditor } from './pages/designs/BomEditor';
import { MachinesView } from './pages/production/MachinesView';
import { OrdersList } from './pages/orders/OrdersList';
import { CreateOrder } from './pages/orders/CreateOrder';
import { OrderWorkspace } from './pages/orders/OrderWorkspace';
import { KanbanBoard } from './pages/production/KanbanBoard';
import { FollowUpCenter } from './pages/production/FollowUpCenter';
import { ProductionCapacity } from './pages/production/ProductionCapacity';
import { WorkerQRScan } from './pages/worker/WorkerQRScan';
import { OrderWorkerWorkspace } from './pages/worker/OrderWorkerWorkspace';
import { Dashboard } from './pages/dashboard/Dashboard';
import { FinancialReports } from './pages/reports/FinancialReports';
import { CustomersList } from './pages/customers/CustomersList';
import { CustomerWorkspace } from './pages/customers/CustomerWorkspace';
import { CustomerCreate } from './pages/customers/CustomerCreate';

import { ProductionCalendar } from './pages/production/ProductionCalendar';
import { Invoices } from './pages/reports/Invoices';
import { Payments } from './pages/reports/Payments';

import { InventoryDashboard } from './pages/inventory/InventoryDashboard';
import { MaterialsLibrary } from './pages/inventory/MaterialsLibrary';
import { OffcutsManager } from './pages/inventory/OffcutsManager';
import { PurchasesList } from './pages/inventory/PurchasesList';
import { SuppliersList } from './pages/suppliers/SuppliersList';

import { EmployeesList } from './pages/hr/EmployeesList';
import { EmployeeProfile } from './pages/hr/EmployeeProfile';
import { EmployeeCreate } from './pages/hr/EmployeeCreate';
import { GlobalTasks } from './pages/tasks/GlobalTasks';
import { ApprovalCenter } from './pages/tasks/ApprovalCenter';
import { WorkspaceOverview } from './pages/workspace/WorkspaceOverview';
import { NotificationCenter } from './pages/workspace/NotificationCenter';
import { AlertsCenter } from './pages/workspace/AlertsCenter';
import { AIAssistant } from './pages/ai/AIAssistant';
import { SystemSettings } from './pages/settings/SystemSettings';
import { RolesManager } from './pages/settings/RolesManager';
import { WorkflowBuilder } from './pages/settings/WorkflowBuilder';
import { AdminPortalHub } from './pages/admin/AdminPortalHub';

import { Toaster } from 'sonner';
import { GlobalModals } from './components/global/GlobalModals';
import { GlobalDrawers } from './components/global/GlobalDrawers';
import { PwaInstallCapture } from './components/pwa/PwaInstallBanner';

import { PublicLayout } from './storefront/components/PublicLayout';
import { Home } from './storefront/pages/Home';
import { Catalog } from './storefront/pages/Catalog';
import { ProductDetails } from './storefront/pages/ProductDetails';
import { CartPage } from './storefront/pages/CartPage';
import { OrderSuccessPage } from './storefront/pages/OrderSuccessPage';
import { About } from './storefront/pages/About';
import { Services } from './storefront/pages/Services';
import { Projects } from './storefront/pages/Projects';
import { Contact } from './storefront/pages/Contact';
import { UnifiedLogin } from './public/pages/Auth/UnifiedLogin';
import { PortalGuard, ErpGuard, RequirePermission } from './components/auth/RouteGuards';
import { 
  PortalDashboard, PortalOrdersList, PortalOrderWorkspace, 
  PortalInvoices, PortalPayments, PortalProfile,
  PortalCatalog, PortalMessages, PortalNotifications, PortalWhatsapp,
  PortalAppointments, PortalFavorites, PortalCustomRequest,
} from './pages/portal';

const PublicPlaceholderPage = ({ title, desc }: { title: string; desc: string }) => (
  <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold mb-4">{title}</h1>
    <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">{desc}</p>
  </div>
);

const ErpShell = () => (
  <ErpGuard>
    <ErpLayout>
      <Outlet />
    </ErpLayout>
  </ErpGuard>
);

const PortalShell = () => (
  <PortalGuard>
    <CustomerLayout>
      <Outlet />
    </CustomerLayout>
  </PortalGuard>
);

const AppRoutes = () => (
  <Routes>
    {/* Public Storefront — explicit paths only (no catch-all /*) */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/catalog/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order-success/:id" element={<OrderSuccessPage />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/privacy"
        element={
          <PublicPlaceholderPage
            title="سياسة الخصوصية"
            desc="تفاصيل سياسة الخصوصية واستخدام البيانات في DecoZR."
          />
        }
      />
      <Route
        path="/terms"
        element={
          <PublicPlaceholderPage
            title="شروط الخدمة"
            desc="الشروط والأحكام الخاصة باستخدام خدماتنا وموقعنا."
          />
        }
      />
    </Route>
    <Route path="/login" element={<UnifiedLogin />} />

    {/* ERP — shared layout so sidebar stays mounted (prevents freeze on navigate) */}
    <Route element={<ErpShell />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/alerts" element={<AlertsCenter />} />
      <Route path="/orders" element={<RequirePermission anyOf={['view_orders']}><OrdersList /></RequirePermission>} />
      <Route path="/orders/create" element={<RequirePermission anyOf={['create_orders']}><CreateOrder /></RequirePermission>} />
      <Route path="/orders/:id" element={<RequirePermission anyOf={['view_orders']}><OrderWorkspace /></RequirePermission>} />
      <Route path="/designs" element={<RequirePermission anyOf={['view_designs']}><DesignsCatalog /></RequirePermission>} />
      <Route path="/designs/:id" element={<RequirePermission anyOf={['view_designs']}><DesignEditor /></RequirePermission>} />
      <Route path="/designs/:id/versions" element={<RequirePermission anyOf={['view_designs']}><VersionsManager /></RequirePermission>} />
      <Route path="/designs/:id/customization" element={<RequirePermission anyOf={['edit_designs']}><CustomizationEditor /></RequirePermission>} />
      <Route path="/designs/:id/bom" element={<RequirePermission anyOf={['edit_designs']}><BomEditor /></RequirePermission>} />
      <Route path="/production" element={<RequirePermission anyOf={['view_production']}><KanbanBoard /></RequirePermission>} />
      <Route path="/follow-up" element={<RequirePermission anyOf={['dispatch_production', 'view_production']}><FollowUpCenter /></RequirePermission>} />
      <Route path="/machines" element={<RequirePermission anyOf={['view_production', 'assign_machines']}><MachinesView /></RequirePermission>} />
      <Route path="/calendar" element={<RequirePermission anyOf={['view_production']}><ProductionCalendar /></RequirePermission>} />
      <Route path="/capacity" element={<RequirePermission anyOf={['view_production']}><ProductionCapacity /></RequirePermission>} />
      <Route path="/offcuts" element={<RequirePermission anyOf={['view_inventory']}><OffcutsManager /></RequirePermission>} />
      <Route path="/inventory" element={<RequirePermission anyOf={['view_inventory']}><InventoryDashboard /></RequirePermission>} />
      <Route path="/materials" element={<RequirePermission anyOf={['view_inventory']}><MaterialsLibrary /></RequirePermission>} />
      <Route path="/purchases" element={<RequirePermission anyOf={['view_purchases']}><PurchasesList /></RequirePermission>} />
      <Route path="/suppliers" element={<RequirePermission anyOf={['view_purchases']}><SuppliersList /></RequirePermission>} />
      <Route path="/customers/new" element={<RequirePermission anyOf={['create_customers']}><CustomerCreate /></RequirePermission>} />
      <Route path="/customers/create" element={<RequirePermission anyOf={['create_customers']}><CustomerCreate /></RequirePermission>} />
      <Route path="/customers/:id" element={<RequirePermission anyOf={['view_customers']}><CustomerWorkspace /></RequirePermission>} />
      <Route path="/customers" element={<RequirePermission anyOf={['view_customers']}><CustomersList /></RequirePermission>} />
      <Route path="/admin/portal" element={<RequirePermission anyOf={['view_customers']}><AdminPortalHub /></RequirePermission>} />
      <Route path="/distributors" element={<RequirePermission anyOf={['view_purchases']}><SuppliersList /></RequirePermission>} />
      <Route path="/invoices" element={<RequirePermission anyOf={['view_finance', 'manage_invoices']}><Invoices /></RequirePermission>} />
      <Route path="/payments" element={<RequirePermission anyOf={['view_finance', 'manage_payments']}><Payments /></RequirePermission>} />
      <Route path="/employees/new" element={<RequirePermission anyOf={['manage_employees']}><EmployeeCreate /></RequirePermission>} />
      <Route path="/employees/:id" element={<RequirePermission anyOf={['view_employees']}><EmployeeProfile /></RequirePermission>} />
      <Route path="/employees" element={<RequirePermission anyOf={['view_employees']}><EmployeesList /></RequirePermission>} />
      <Route path="/tasks" element={<RequirePermission anyOf={['view_tasks']}><GlobalTasks /></RequirePermission>} />
      <Route path="/approvals" element={<RequirePermission anyOf={['approve_orders', 'manage_tasks']}><ApprovalCenter /></RequirePermission>} />
      <Route path="/notifications" element={<NotificationCenter />} />
      <Route path="/reports" element={<RequirePermission anyOf={['view_reports']}><FinancialReports /></RequirePermission>} />
      <Route path="/workspace" element={<WorkspaceOverview />} />
      <Route path="/ai" element={<AIAssistant />} />
      <Route path="/settings/roles" element={<RequirePermission anyOf={['manage_roles']}><RolesManager /></RequirePermission>} />
      <Route path="/settings" element={<RequirePermission anyOf={['view_settings']}><SystemSettings /></RequirePermission>} />
      <Route path="/workflows" element={<RequirePermission anyOf={['manage_settings']}><WorkflowBuilder /></RequirePermission>} />
    </Route>

    {/* Worker Routes */}
    <Route path="/w" element={<WorkerQRScan />} />
    <Route path="/w/:token" element={<OrderWorkerWorkspace />} />

    {/* Customer Portal — shared layout */}
    <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
    <Route element={<PortalShell />}>
      <Route path="/portal/dashboard" element={<PortalDashboard />} />
      <Route path="/portal/catalog" element={<PortalCatalog />} />
      <Route path="/portal/orders" element={<PortalOrdersList />} />
      <Route path="/portal/orders/:id" element={<PortalOrderWorkspace />} />
      <Route path="/portal/messages" element={<PortalMessages />} />
      <Route path="/portal/notifications" element={<PortalNotifications />} />
      <Route path="/portal/whatsapp" element={<PortalWhatsapp />} />
      <Route path="/portal/appointments" element={<PortalAppointments />} />
      <Route path="/portal/favorites" element={<PortalFavorites />} />
      <Route path="/portal/custom-request" element={<PortalCustomRequest />} />
      <Route path="/portal/invoices" element={<PortalInvoices />} />
      <Route path="/portal/payments" element={<PortalPayments />} />
      <Route path="/portal/profile" element={<PortalProfile />} />
    </Route>
    <Route path="/portal/*" element={<Navigate to="/portal/dashboard" replace />} />
  </Routes>
);

function AuthSessionSync() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  useEffect(() => {
    if (accessToken) refreshMe();
  }, [accessToken, refreshMe]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthSessionSync />
        <Toaster 
          position="top-left" 
          dir="rtl"
          toastOptions={{
            style: {
              background: 'var(--color-bg-main)',
              color: 'var(--color-text-main)',
              border: '1px solid var(--color-border)',
              fontFamily: 'Cairo, sans-serif'
            }
          }}
        />
        <GlobalModals />
        <GlobalDrawers />
        <CommandPalette />
        <PwaInstallCapture />
        <AppRoutes />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
