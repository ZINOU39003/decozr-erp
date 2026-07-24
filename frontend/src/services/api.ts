import { apiClient } from './apiClient';

export { apiClient };

// --- Auth ---
export const login = async (email: string, password: string) =>
  apiClient.post('/auth/login', { email, password });

// --- Dashboard ---
export const getDashboardSummary = async () => apiClient.get('/dashboard/summary');

// --- Customers ---
export const getCustomers = async (params?: Record<string, unknown>) => {
  const safeParams =
    params && typeof params === 'object' && !('queryKey' in params) && !('signal' in params)
      ? params
      : undefined;
  return apiClient.get('/customers', { params: safeParams });
};
export const getPriceLists = async () => apiClient.get('/customers/price-lists');
export const createCustomer = async (data: any) => apiClient.post('/customers', data);
export const updateCustomer = async (id: string, data: any) => apiClient.patch(`/customers/${id}`, data);
export const deleteCustomer = async (id: string) => apiClient.delete(`/customers/${id}`);
export const addPayment = async (customerId: string, amount: number, payment_method: string, notes?: string) =>
  apiClient.post(`/customers/${customerId}/payments`, { amount, payment_method, notes });
export const getCustomerActivities = async (customerId: string) =>
  apiClient.get(`/customers/${customerId}/activities`);
export const createCustomerActivity = async (customerId: string, data: any) =>
  apiClient.post(`/customers/${customerId}/activities`, data);
export const activateCustomerPortal = async (
  customerId: string,
  data?: { email?: string; password?: string }
) => apiClient.post(`/customers/${customerId}/activate-portal`, data || {});

// --- Customer Portal ---
export const getPortalMe = async () => apiClient.get('/portal/me');
export const getPortalDashboard = async () => apiClient.get('/portal/dashboard');
export const getPortalOrders = async () => apiClient.get('/portal/orders');
export const getPortalOrder = async (id: string) => apiClient.get(`/portal/orders/${id}`);
export const getPortalInvoices = async () => apiClient.get('/portal/invoices');
export const getPortalPayments = async () => apiClient.get('/portal/payments');
export const getPortalPaymentSummary = async () => apiClient.get('/portal/payments/summary');
export const submitPortalPaymentProof = async (data: {
  amount: number;
  payment_method: string;
  reference?: string;
  notes?: string;
  receipt_url?: string;
  order_id?: string;
  invoice_id?: string;
}) => apiClient.post('/portal/payments/proof', data);
export const uploadPortalReceipt = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post('/portal/payments/receipt', form, { timeout: 60000 });
};
export const updatePortalProfile = async (data: {
  name_ar?: string;
  phone?: string;
  city?: string;
  address_ar?: string;
  avatar_url?: string;
}) => apiClient.patch('/portal/me', data);
export const getPortalCustomRequests = async () => apiClient.get('/portal/custom-requests');
export const createPortalCustomRequest = async (data: {
  request_type: string;
  title_ar: string;
  description_ar: string;
  width_cm?: number;
  height_cm?: number;
  depth_cm?: number;
  material_hint?: string;
  reference_image?: string;
}) => apiClient.post('/portal/custom-requests', data);
export const getPortalSupportMessages = async () => apiClient.get('/portal/support/messages');
export const postPortalSupportMessage = async (body_ar: string, attachment_url?: string) =>
  apiClient.post('/portal/support/messages', { body_ar, attachment_url });
export const getPortalFavorites = async () => apiClient.get('/portal/favorites');
export const togglePortalFavorite = async (designId: string) =>
  apiClient.post(`/portal/favorites/${designId}`);
export const getPortalAppointments = async () => apiClient.get('/portal/appointments');
export const getPortalCatalog = async () => apiClient.get('/portal/catalog');
export const createPortalOrder = async (data: {
  items: Array<{
    design_id: string;
    design_version_id?: string;
    quantity: number;
    options?: Record<string, unknown>;
  }>;
  notes?: string;
}) => apiClient.post('/portal/orders', data);
export const getPortalChatThreads = async () => apiClient.get('/portal/chat/threads');
export const getPortalChatMessages = async (orderId: string) =>
  apiClient.get(`/portal/chat/threads/${orderId}`);
export const postPortalChatMessage = async (orderId: string, body_ar: string) =>
  apiClient.post(`/portal/chat/threads/${orderId}`, { body_ar });
export const getPortalNotifications = async () => apiClient.get('/portal/notifications');
export const markPortalNotificationsRead = async () =>
  apiClient.patch('/portal/notifications/read-all');
export const markPortalNotificationRead = async (id: string) =>
  apiClient.patch(`/portal/notifications/${id}/read`);
export const getPortalWhatsapp = async () => apiClient.get('/portal/whatsapp');

// --- Orders ---
export const getOrders = async (params?: Record<string, unknown>) =>
  apiClient.get('/orders', { params });
export const getDashboardAlerts = async () => apiClient.get('/dashboard/alerts');
export const getSystemSettings = async () => apiClient.get('/settings');
export const saveSystemSettingsBulk = async (data: Record<string, unknown>) =>
  apiClient.post('/settings/bulk', data);
export const getPublicStorefront = async () =>
  apiClient.get('/settings/public/storefront');
export const getOrderById = async (id: string) => apiClient.get(`/orders/${id}`);
export const getOrderByQr = async (token: string) => apiClient.get(`/orders/by-qr/${token}`);
export const createOrder = async (data: any) => apiClient.post('/orders', data);
export const createPublicOrder = async (data: {
  customer: {
    name_ar: string;
    phone: string;
    email?: string;
    city?: string;
    address_ar?: string;
  };
  items: Array<{
    design_id: string;
    design_version_id?: string;
    quantity: number;
    options?: Record<string, unknown>;
  }>;
  notes?: string;
}) => apiClient.post('/orders/public', data);
export const updateOrder = async (id: string, data: any) => apiClient.patch(`/orders/${id}`, data);
export const deleteOrder = async (id: string) => apiClient.delete(`/orders/${id}`);
export const changeOrderStatus = async (id: string, status: string, notes?: string) =>
  apiClient.put(`/orders/${id}/status`, { status, notes });
export const finishOrderDesign = async (id: string, notes?: string) =>
  apiClient.post(`/orders/${id}/finish-design`, { notes });
export const getOrderRouteSuggestion = async (id: string) =>
  apiClient.get(`/orders/${id}/route-suggestion`);
export const dispatchOrderProduction = async (
  id: string,
  data: {
    target_stage: 'in_cutting' | 'in_printing';
    assignee_user_id?: string;
    notes?: string;
  },
) => apiClient.post(`/orders/${id}/dispatch`, data);
export const getFollowUpBoard = async () => apiClient.get('/orders/board/follow-up');
export const reorderOrder = async (id: string) => apiClient.post(`/orders/${id}/reorder`);
export const addOrderMedia = async (
  id: string,
  images: { url: string; purpose?: string; caption?: string }[],
) => apiClient.post(`/orders/${id}/media`, { images });
export const startWorkerJobByQr = async (token: string, jobId: string) =>
  apiClient.post(`/orders/by-qr/${token}/jobs/${jobId}/start`);
export const completeWorkerJobByQr = async (token: string, jobId: string, actual_minutes: number) =>
  apiClient.post(`/orders/by-qr/${token}/jobs/${jobId}/complete`, { actual_minutes });

// --- Workshop notifications ---
export const getNotifications = async (params?: Record<string, unknown>) =>
  apiClient.get('/notifications', { params });
export const getNotificationsUnreadCount = async () =>
  apiClient.get('/notifications/unread-count');
export const markNotificationsReadAll = async () => apiClient.patch('/notifications/read-all');
export const markNotificationRead = async (id: string) =>
  apiClient.patch(`/notifications/${id}/read`);

// --- Order Workspace ---
export const getOrderWorkspace = async (id: string) => apiClient.get(`/orders/${id}/workspace`);
export const getOrderMessages = async (id: string) => apiClient.get(`/orders/${id}/messages`);
export const postOrderMessage = async (id: string, body_ar: string, attachment_file_id?: string) =>
  apiClient.post(`/orders/${id}/messages`, { body_ar, attachment_file_id });
export const getOrderTimeline = async (id: string) => apiClient.get(`/orders/${id}/timeline`);

// --- Designs ---
export const getDesignCategories = async () => apiClient.get('/designs/categories');
export const createDesignCategory = async (data: { name_ar: string; slug?: string }) =>
  apiClient.post('/designs/categories', data);
export const getDesigns = async (params?: {
  catalog?: boolean;
  library_status?: string;
  owner_customer_id?: string;
}) => apiClient.get('/designs', { params });
export const getDesignById = async (id: string) => apiClient.get(`/designs/${id}`);
export const createDesign = async (data: any) => apiClient.post('/designs', data);
export const updateDesign = async (id: string, data: any) => apiClient.put(`/designs/${id}`, data);
export const deleteDesign = async (id: string) => apiClient.delete(`/designs/${id}`);
export const calculatePrice = async (data: {
  design_version_id: string;
  options: Record<string, unknown>;
  price_list_id: string;
}) => apiClient.post('/designs/calculate-price', data);
export const calculateBom = async (data: {
  design_version_id: string;
  options: Record<string, unknown>;
}) => apiClient.post('/designs/calculate-bom', data);

// --- Design Versions ---
export const getDesignVersions = async (designId: string) =>
  apiClient.get(`/designs/${designId}/versions`);
export const createDesignVersion = async (designId: string, data: any) =>
  apiClient.post(`/designs/${designId}/versions`, data);
export const updateDesignVersion = async (designId: string, versionId: string, data: any) =>
  apiClient.put(`/designs/${designId}/versions/${versionId}`, data);
export const addCustomizationOption = async (designId: string, versionId: string, data: any) =>
  apiClient.post(`/designs/${designId}/versions/${versionId}/customization-options`, data);
export const addBomMaterial = async (designId: string, versionId: string, data: any) =>
  apiClient.post(`/designs/${designId}/versions/${versionId}/bom-materials`, data);
export const addBomLabor = async (designId: string, versionId: string, data: any) =>
  apiClient.post(`/designs/${designId}/versions/${versionId}/bom-labor`, data);
export const setPriceRule = async (designId: string, versionId: string, data: any) =>
  apiClient.post(`/designs/${designId}/versions/${versionId}/price-rules`, data);

// --- Materials / Suppliers / HR ---
export const getMaterials = async () => apiClient.get('/materials');
export const createMaterial = async (data: any) => apiClient.post('/materials', data);
export const updateMaterial = async (id: string, data: any) => apiClient.patch(`/materials/${id}`, data);
export const deleteMaterial = async (id: string) => apiClient.delete(`/materials/${id}`);
export const getSuppliers = async () => apiClient.get('/suppliers');
export const createSupplier = async (data: any) => apiClient.post('/suppliers', data);
export const updateSupplier = async (id: string, data: any) => apiClient.patch(`/suppliers/${id}`, data);
export const deleteSupplier = async (id: string) => apiClient.delete(`/suppliers/${id}`);
export const getEmployees = async () => apiClient.get('/employees');
export const getEmployee = async (id: string) => apiClient.get(`/employees/${id}`);
export const createEmployee = async (data: any) => apiClient.post('/employees', data);
export const updateEmployee = async (id: string, data: any) => apiClient.patch(`/employees/${id}`, data);
export const deleteEmployee = async (id: string) => apiClient.delete(`/employees/${id}`);
export const addEmployeeAttendance = async (id: string, data: any) =>
  apiClient.post(`/employees/${id}/attendance`, data);
export const addEmployeeSalary = async (id: string, data: any) =>
  apiClient.post(`/employees/${id}/salary`, data);
export const getEmployeeAccess = async (id: string) => apiClient.get(`/employees/${id}/access`);
export const setEmployeeAccess = async (id: string, data: any) =>
  apiClient.put(`/employees/${id}/access`, data);

// --- Roles & Permissions ---
export const getRoles = async () => apiClient.get('/roles');
export const getPermissionsCatalog = async () => apiClient.get('/permissions');
export const createRole = async (data: any) => apiClient.post('/roles', data);
export const updateRole = async (id: string, data: any) => apiClient.patch(`/roles/${id}`, data);
export const deleteRole = async (id: string) => apiClient.delete(`/roles/${id}`);
export const setRolePermissions = async (id: string, permissions: string[]) =>
  apiClient.put(`/roles/${id}/permissions`, { permissions });
export const getUserAccess = async (userId: string) => apiClient.get(`/users/${userId}/access`);
export const setUserAccess = async (userId: string, data: any) =>
  apiClient.put(`/users/${userId}/access`, data);

// --- Production / Machines ---
export const getShortageReport = async (orderId: string) =>
  apiClient.get(`/production/shortage-report/${orderId}`);
export const startProduction = async (orderId: string) =>
  apiClient.post(`/production/start/${orderId}`);
export const getMachines = async () => apiClient.get('/machines');
export const createMachine = async (data: any) => apiClient.post('/machines', data);
export const getMachineJobs = async () => apiClient.get('/machines/jobs');
export const startMachineJob = async (jobId: string) =>
  apiClient.post(`/machines/jobs/${jobId}/start`);
export const completeMachineJob = async (jobId: string, actual_minutes: number) =>
  apiClient.post(`/machines/jobs/${jobId}/complete`, { actual_minutes });

// --- Offcuts (v3) ---
export const getOffcuts = async (params?: Record<string, unknown>) =>
  apiClient.get('/offcuts', { params });
export const createOffcut = async (data: any) => apiClient.post('/offcuts', data);
export const updateOffcut = async (id: string, data: any) => apiClient.patch(`/offcuts/${id}`, data);
export const deleteOffcut = async (id: string) => apiClient.delete(`/offcuts/${id}`);
export const findAvailableOffcuts = async (materialId: string, width: number, height: number) =>
  apiClient.get('/offcuts/available', { params: { materialId, width, height } });

// --- Workflows (v3) ---
export const getWorkflowTemplates = async () => apiClient.get('/workflows/templates');
export const getWorkflowTemplate = async (id: string) => apiClient.get(`/workflows/templates/${id}`);
export const createWorkflowTemplate = async (data: any) => apiClient.post('/workflows/templates', data);
export const updateWorkflowTemplate = async (id: string, data: any) =>
  apiClient.patch(`/workflows/templates/${id}`, data);
export const addWorkflowStage = async (templateId: string, data: any) =>
  apiClient.post(`/workflows/templates/${templateId}/stages`, data);
export const deleteWorkflowStage = async (stageId: string) =>
  apiClient.delete(`/workflows/stages/${stageId}`);
export const linkDesignWorkflow = async (designId: string, templateId: string) =>
  apiClient.post(`/workflows/designs/${designId}/link`, { template_id: templateId });

// --- Seasons (v3) ---
export const getSeasons = async () => apiClient.get('/seasons');
export const createSeason = async (data: any) => apiClient.post('/seasons', data);
export const updateSeason = async (id: string, data: any) => apiClient.patch(`/seasons/${id}`, data);
export const deleteSeason = async (id: string) => apiClient.delete(`/seasons/${id}`);
export const linkDesignSeason = async (seasonId: string, designId: string) =>
  apiClient.post(`/seasons/${seasonId}/designs/${designId}`);
export const unlinkDesignSeason = async (seasonId: string, designId: string) =>
  apiClient.delete(`/seasons/${seasonId}/designs/${designId}`);

// --- Capacity (v3) ---
export const getCapacityForecast = async (from: string, days = 7) =>
  apiClient.get('/capacity/forecast', { params: { from, days } });

export const uploadDesignImages = async (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  return apiClient.post('/uploads/images', form, { timeout: 120000 });
};

// --- Finance ---
export const getInvoices = async (params?: Record<string, unknown>) =>
  apiClient.get('/invoices', { params });
export const getPayments = async () => apiClient.get('/payments');

// --- Admin Portal Bridge ---
export const getAdminPortalInbox = async () => apiClient.get('/admin/portal/inbox');
export const getAdminPortalPayments = async () => apiClient.get('/admin/portal/payments');
export const reviewAdminPortalPayment = async (
  id: string,
  action: 'confirm' | 'reject',
  note?: string
) => apiClient.patch(`/admin/portal/payments/${id}/review`, { action, note });
export const getAdminPortalSupportThreads = async () =>
  apiClient.get('/admin/portal/support/threads');
export const getAdminPortalSupportMessages = async (customerId: string) =>
  apiClient.get(`/admin/portal/support/${customerId}`);
export const replyAdminPortalSupport = async (customerId: string, body_ar: string) =>
  apiClient.post(`/admin/portal/support/${customerId}/reply`, { body_ar });
export const getAdminPortalCustomRequests = async () =>
  apiClient.get('/admin/portal/custom-requests');
export const updateAdminPortalCustomRequest = async (id: string, status: string, note?: string) =>
  apiClient.patch(`/admin/portal/custom-requests/${id}`, { status, note });
export const getAdminPortalAppointments = async () =>
  apiClient.get('/admin/portal/appointments');
export const upsertAdminPortalAppointment = async (data: any) =>
  apiClient.post('/admin/portal/appointments', data);

export const mediaUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const api = import.meta.env.VITE_API_URL || '/api/v1';
  // Absolute API host (e.g. http://localhost:3000/api/v1) → strip /api/v1
  // Relative API (/api/v1) → same origin (works on phone via Vite proxy)
  const base = api.startsWith('http')
    ? api.replace(/\/api\/v1\/?$/, '')
    : '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
