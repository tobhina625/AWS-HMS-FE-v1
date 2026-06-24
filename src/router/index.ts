import { createRouter, createWebHistory } from 'vue-router';

import SigninView from '@/views/Authentication/SigninView.vue';
import PatientListView from '../views/PatientsUI/ListView.vue';
import PatientAddView from '../views/PatientsUI/AddView.vue';
import PatientEditView from '@/views/PatientsUI/EditView.vue';
import PatientProfileView from '@/views/PatientsUI/ProfileView.vue';
import WardListView from '@/views/WardsUI/ListView.vue';
import WardAddView from '@/views/WardsUI/AddView.vue';
import WardEditView from '@/views/WardsUI/EditView.vue';
import WardBedManagementView from '@/views/WardsUI/BedManagementView.vue';
import WardProfileView from '@/views/WardsUI/ProfileView.vue';
import SettingsView from '@/views/Pages/SettingsView.vue';
import DepartmentsListView from '@/views/DepartmentUI/ListView.vue';
import DashboardView from '@/views/Dashboard/DashboardView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import PatientHistoryAddView from '@/components/PatientHistory/PatientHistoryAdd.vue';
import PatientHistoryEditView from '@/components/PatientHistory/PatientHistoryEdit.vue';
import SurgeryListView from '@/views/SurgeryUI/ListView.vue';
import SurgeryAddView from '@/views/SurgeryUI/AddView.vue';
import ProfileView from '@/views/Profile/ProfileView.vue';
import AddView from '../views/DepartmentUI/AddView.vue';
import EditView from '../views/DepartmentUI/EditView.vue';
import DepartmentProfileView from '../views/DepartmentUI/ProfileView.vue';
import EmployeeListView from '../views/EmployeesUI/ListView.vue';
import EmployeeAddView from '../views/EmployeesUI/AddView.vue';
import EmployeeEditView from '../views/EmployeesUI/EditView.vue';
import EmployeeProfileView from '../views/EmployeesUI/ProfileView.vue';
import ListView from '@/views/DesignationUI/ListView.vue';
import DesignationAddView from '@/views/DesignationUI/AddView.vue';
import DesignationEditView from '@/views/DesignationUI/EditView.vue';
import DesignationProfileView from '@/views/DesignationUI/ProfileView.vue';
import SurgeryEditView from '@/views/SurgeryUI/EditView.vue';
import DiseaseListView from '@/views/DiseaseUI/ListView.vue';
import DiseaseAddView from '@/views/DiseaseUI/AddView.vue';
import DiseaseEditView from '@/views/DiseaseUI/EditView.vue';
import OperationTheatreListView from '@/views/OperationTheatreUI/ListView.vue';
import OperationTheatreAddView from '@/views/OperationTheatreUI/AddView.vue';
import OpeartionTheatreEditView from '@/views/OperationTheatreUI/EditView.vue';
import PatientDetail from '@/views/PatientHistoryUIForPatient/detailView.vue';
import EmployeesListForPermissions from '@/views/EmployeePermissionsUI/ListView.vue';
import EmployeesPermissionsView from '@/views/EmployeePermissionsUI/EmployeePermissions.vue';
import RolesListForPermissions from '@/views/RolePermissionsUI/ListView.vue';
import RolesPermissionsView from '@/views/RolePermissionsUI/RolePermissions.vue';
import PatientUIListView from '../views/PatientBillUI/ListView.vue';
import PatientsBillsAddView from '../views/PatientBillUI/AddView.vue';
import AppointmentListView from '@/views/AppointmentUI/ListView.vue';
import AppointmentAddView from '@/views/AppointmentUI/AddView.vue';
import AppointmentEditView from '@/views/AppointmentUI/EditView.vue';
import InventoryListView from '@/views/InventoryUI/ListView.vue';
import InventoryAddView from '@/views/InventoryUI/AddView.vue';
import InventoryEditView from '@/views/InventoryUI/EditView.vue';
import PermissionListView from '@/views/PermissionUI/ListView.vue';
import PermissionAddView from '@/views/PermissionUI/AddView.vue';
import PermissionEditView from '@/views/PermissionUI/EditView.vue';
import ModuleListView from '@/views/ModuleUI/ListView.vue';
import ModuleAddView from '@/views/ModuleUI/AddView.vue';
import ModuleEditView from '@/views/ModuleUI/EditView.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: {
      title: 'Dashboard',
      requiredAuth: true,
    },
  },
  {
    path: '/permissions/employees',
    name: 'EmployeesListForAdmin',
    component: EmployeesListForPermissions,
    meta: {
      title: 'Employees List For Admin',
      requiresAuth: true,
    },
  },
  {
    path: '/permissions/employee/:id',
    name: 'EmployeesPermissions',
    component: EmployeesPermissionsView,
    meta: {
      title: 'Employees Permissions',
      requiresAuth: true,
    },
  },
  {
    path: '/permissions/roles',
    name: 'RolesListForAdmin',
    component: RolesListForPermissions,
    meta: {
      title: 'Roles List For Admin',
      requiresAuth: true,
    },
  },
  {
    path: '/permissions/role/:id',
    name: 'RolesPermissions',
    component: RolesPermissionsView,
    meta: {
      title: 'Roles Permissions',
      requiresAuth: true,
    },
  },
  {
    path: '/permissions',
    name: 'PermissionsList',
    component: PermissionListView,
    meta: {
      title: 'Permissions Management',
      requiresAuth: true,
    },
  },
  {
    path: '/permissions/add',
    name: 'PermissionAdd',
    component: PermissionAddView,
    meta: {
      title: 'Add Permission',
      requiresAuth: true,
    },
  },
  {
    path: '/permissions/edit/:id',
    name: 'PermissionEdit',
    component: PermissionEditView,
    meta: {
      title: 'Edit Permission',
      requiresAuth: true,
    },
  },
  {
    path: '/modules',
    name: 'ModulesList',
    component: ModuleListView,
    meta: {
      title: 'Modules Management',
      requiresAuth: true,
    },
  },
  {
    path: '/modules/add',
    name: 'ModuleAdd',
    component: ModuleAddView,
    meta: {
      title: 'Add Module',
      requiresAuth: true,
    },
  },
  {
    path: '/modules/edit/:id',
    name: 'ModuleEdit',
    component: ModuleEditView,
    meta: {
      title: 'Edit Module',
      requiresAuth: true,
    },
  },
  {
    path: '/patienthistoryforpatient',
    name: 'PatientHistory',
    component: PatientDetail,
    meta: {
      title: 'Patient History',
      requiresAuth: true,
    },
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: ProfileView,
    meta: {
      title: 'Doctor Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/surgery',
    name: 'surgery',
    component: SurgeryListView,
    meta: {
      title: 'Surgeries',
      requiredAuth: true,
    },
  },
  {
    path: '/surgery/add',
    name: 'surgeryAdd',
    component: SurgeryAddView,
    meta: {
      title: 'Add Surgery',
      requiresAuth: true,
    },
  },
  {
    path: '/surgery/edit/:id',
    name: 'surgeryEdit',
    component: SurgeryEditView,
    meta: {
      title: 'Edit Surgery',
      requiresAuth: true,
    },
  },
  {
    path: '/surgery/profile/:id',
    name: 'SurgeryProfile',
    component: () => import('@/views/SurgeryUI/ProfileView.vue'),
    meta: {
      title: 'Surgery Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/disease',
    name: 'diseases',
    component: DiseaseListView,
    meta: {
      title: 'Diseases',
      requiredAuth: true,
    },
  },
  {
    path: '/disease/add',
    name: 'diseaseAdd',
    component: DiseaseAddView,
    meta: {
      title: 'Add Disease',
      requiresAuth: true,
    },
  },
  {
    path: '/disease/edit/:id',
    name: 'diseaseEdit',
    component: DiseaseEditView,
    meta: {
      title: 'Edit Designation',
      requiresAuth: true,
    },
  },
  {
    path: '/patients',
    name: 'Patients',
    component: PatientListView,
    meta: {
      title: 'Patients',
      requiredAuth: true,
    },
  },
  {
    path: '/patients/add',
    name: 'PatientAdd',
    component: PatientAddView,
    meta: {
      title: 'Add Patient Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/patients/edit/:id',
    name: 'PatientEdit',
    component: PatientEditView,
    meta: {
      title: 'Edit Patient Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/patients/profile/:id',
    name: 'PatientProfile',
    component: PatientProfileView,
    meta: {
      title: 'Patient Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/wards',
    name: 'Wards',
    component: WardListView,
    meta: {
      title: 'Wards',
      requiredAuth: true,
    },
  },
  {
    path: '/wards/add',
    name: 'WardAdd',
    component: WardAddView,
    meta: {
      title: 'Add Ward Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/wards/edit/:id',
    name: 'WardEdit',
    component: WardEditView,
    meta: {
      title: 'Edit Ward Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/wards/profile/:id',
    name: 'WardProfile',
    component: WardProfileView,
    meta: {
      title: 'Ward Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/wards/:id/beds',
    name: 'WardBedManagement',
    component: WardBedManagementView,
    meta: {
      title: 'Ward Bed Management',
      requiresAuth: true,
    },
  },
  {
    path: '/patient-history/add',
    name: 'PatientHistoryAdd',
    component: PatientHistoryAddView,
    meta: {
      title: 'Add Patient History',
      requiresAuth: true,
    },
  },
  {
    path: '/patient-history/edit/:id',
    name: 'PatientHistoryEdit',
    component: PatientHistoryEditView,
    meta: {
      title: 'Edit Patient History',
      requiresAuth: true,
    },
  },

  {
    path: '/designations',
    name: 'designation',
    component: ListView,
    meta: {
      title: 'Designations',
      requiresAuth: true,
    },
  },
  {
    path: '/designations/add',
    name: 'designationAdd',
    component: DesignationAddView,
    meta: {
      title: 'Add Designation',
      requiresAuth: true,
    },
  },
  {
    path: '/designations/edit/:id',
    name: 'designationEdit',
    component: DesignationEditView,
    meta: {
      title: 'Edit Designation',
      requiresAuth: true,
    },
  },
  {
    path: '/designations/profile/:id',
    name: 'designationProfile',
    component: DesignationProfileView,
    meta: {
      title: 'Designation Details',
      requiresAuth: true,
    },
  },
  {
    path: '/operation-theatre',
    name: 'OperationTheatre',
    component: OperationTheatreListView,
    meta: {
      title: 'Operation Theatre',
      requiredAuth: true,
    },
  },
  {
    path: '/operation-theatre/add',
    name: 'OperationTheatreAdd',
    component: OperationTheatreAddView,
    meta: {
      title: 'Add Operation Theatre',
      requiresAuth: true,
    },
  },
  {
    path: '/operation-theatre/edit/:id',
    name: 'OpeartionTheatreEdit',
    component: OpeartionTheatreEditView,
    meta: {
      title: 'Operation Theatre Edit',
      requiresAuth: true,
    },
  },
  {
    path: '/operation-theatre/profile/:id',
    name: 'OperationTheatreProfile',
    component: () => import('@/views/OperationTheatreUI/ProfileView.vue'),
    meta: {
      title: 'Operation Theatre Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/departments',
    name: 'departments',
    component: DepartmentsListView,
    meta: {
      title: 'Departments',
      requiredAuth: true,
    },
  },
  {
    path: '/departments/add',
    name: 'departmentAdd',
    component: AddView,
    meta: {
      title: 'Add Department',
      requiresAuth: true,
    },
  },
  {
    path: '/departments/edit/:id',
    name: 'departmentEdit',
    component: EditView,
    meta: {
      title: 'Edit Department',
      requiresAuth: true,
    },
  },
  {
    path: '/departments/profile/:id',
    name: 'departmentProfile',
    component: DepartmentProfileView,
    meta: {
      title: 'Department Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/patient-bill',
    name: 'patientbill',
    component: PatientUIListView,
    meta: {
      title: 'Patient Bill',
      requiredAuth: true,
    },
  },

  {
    path: '/employees',
    name: 'Employees',
    component: EmployeeListView,
    meta: {
      title: 'Employees',
      requiredAuth: true,
    },
  },

  {
    path: '/patient-bills/add',
    name: 'patientbillsAdd',
    component: PatientsBillsAddView,
    meta: {
      title: 'Add Patient Bill',
      requiresAuth: true,
    },
  },

  {
    path: '/employees/add',
    name: 'EmployeeAdd',
    component: EmployeeAddView,
    meta: {
      title: 'Add Employee Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/employees/edit/:id',
    name: 'EmployeeEdit',
    component: EmployeeEditView,
    meta: {
      title: 'Edit Employee Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/employees/profile/:id',
    name: 'EmployeeProfile',
    component: EmployeeProfileView,
    meta: {
      title: 'Employee Profile',
      requiresAuth: true,
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      title: 'Settings',
      requiredAuth: true,
    },
  },
  {
    path: '/signin',
    name: 'signin',
    component: SigninView,
    meta: {
      title: 'Signin',
    },
  },
  {
    path: '/appointments',
    name: 'appointments',
    component: AppointmentListView,
    meta: {
      title: 'Appointments',
      requiresAuth: true,
    },
  },
  {
    path: '/appointments/add',
    name: 'appointmentAdd',
    component: AppointmentAddView,
    meta: {
      title: 'Schedule Appointment',
      requiresAuth: true,
    },
  },
  {
    path: '/appointments/edit/:id',
    name: 'appointmentEdit',
    component: AppointmentEditView,
    meta: {
      title: 'Edit Appointment',
      requiresAuth: true,
    },
  },
  {
    path: '/inventory',
    name: 'InventoryList',
    component: InventoryListView,
    meta: {
      title: 'Inventory',
      requiresAuth: true,
    },
  },
  {
    path: '/inventory/add',
    name: 'InventoryAdd',
    component: InventoryAddView,
    meta: {
      title: 'Add Inventory Item',
      requiresAuth: true,
    },
  },
  {
    path: '/inventory/edit/:id',
    name: 'InventoryEdit',
    component: InventoryEditView,
    meta: {
      title: 'Edit Inventory Item',
      requiresAuth: true,
    },
  },

  // ─── Lab Tests ─────────────────────────────────────────────────────────
  {
    path: '/lab-tests',
    name: 'LabTestsList',
    component: () => import('@/views/LabTestUI/ListView.vue'),
    meta: { title: 'Lab Tests', requiresAuth: true },
  },
  {
    path: '/lab-tests/add',
    name: 'LabTestAdd',
    component: () => import('@/views/LabTestUI/AddView.vue'),
    meta: { title: 'Add Lab Test', requiresAuth: true },
  },
  {
    path: '/lab-tests/edit/:id',
    name: 'LabTestEdit',
    component: () => import('@/views/LabTestUI/EditView.vue'),
    meta: { title: 'Edit Lab Test', requiresAuth: true },
  },

  // ─── Roles ─────────────────────────────────────────────────────────────
  {
    path: '/roles',
    name: 'RolesList',
    component: () => import('@/views/RoleUI/ListView.vue'),
    meta: { title: 'Roles', requiresAuth: true },
  },
  {
    path: '/roles/add',
    name: 'RoleAdd',
    component: () => import('@/views/RoleUI/AddView.vue'),
    meta: { title: 'Add Role', requiresAuth: true },
  },
  {
    path: '/roles/edit/:id',
    name: 'RoleEdit',
    component: () => import('@/views/RoleUI/EditView.vue'),
    meta: { title: 'Edit Role', requiresAuth: true },
  },

  // ─── Vendors ───────────────────────────────────────────────────────────
  {
    path: '/vendors',
    name: 'VendorsList',
    component: () => import('@/views/VendorUI/ListView.vue'),
    meta: { title: 'Vendors', requiresAuth: true },
  },
  {
    path: '/vendors/add',
    name: 'VendorAdd',
    component: () => import('@/views/VendorUI/AddView.vue'),
    meta: { title: 'Add Vendor', requiresAuth: true },
  },
  {
    path: '/vendors/edit/:id',
    name: 'VendorEdit',
    component: () => import('@/views/VendorUI/EditView.vue'),
    meta: { title: 'Edit Vendor', requiresAuth: true },
  },

  // ─── Admissions ────────────────────────────────────────────────────────
  {
    path: '/admissions',
    name: 'AdmissionsList',
    component: () => import('@/views/AdmissionUI/ListView.vue'),
    meta: { title: 'Admissions', requiresAuth: true },
  },
  {
    path: '/admissions/add',
    name: 'AdmissionAdd',
    component: () => import('@/views/AdmissionUI/AddView.vue'),
    meta: { title: 'Add Admission', requiresAuth: true },
  },
  {
    path: '/admissions/edit/:id',
    name: 'AdmissionEdit',
    component: () => import('@/views/AdmissionUI/EditView.vue'),
    meta: { title: 'Edit Admission', requiresAuth: true },
  },
  {
    path: '/admissions/queue',
    name: 'AdmissionQueue',
    component: () => import('@/views/AdmissionUI/QueueView.vue'),
    meta: { title: 'Admission queue', requiresAuth: true },
  },
  {
    path: '/admissions/:id',
    name: 'AdmissionDetail',
    component: () => import('@/views/AdmissionUI/DetailView.vue'),
    meta: { title: 'Admission Details', requiresAuth: true },
  },

  // ─── Patient Surgeries ─────────────────────────────────────────────────
  {
    path: '/patient-surgeries',
    name: 'PatientSurgeriesList',
    component: () => import('@/views/PatientSurgeryUI/ListView.vue'),
    meta: { title: 'Patient Surgeries', requiresAuth: true },
  },
  {
    path: '/patient-surgeries/add',
    name: 'PatientSurgeryAdd',
    component: () => import('@/views/PatientSurgeryUI/AddView.vue'),
    meta: { title: 'Schedule Patient Surgery', requiresAuth: true },
  },
  {
    path: '/patient-surgeries/edit/:id',
    name: 'PatientSurgeryEdit',
    component: () => import('@/views/PatientSurgeryUI/EditView.vue'),
    meta: { title: 'Edit Patient Surgery', requiresAuth: true },
  },

  // ─── Branches ──────────────────────────────────────────────────────────
  {
    path: '/branches',
    name: 'BranchesList',
    component: () => import('@/views/BranchUI/ListView.vue'),
    meta: { title: 'Branches', requiresAuth: true },
  },
  {
    path: '/branches/add',
    name: 'BranchAdd',
    component: () => import('@/views/BranchUI/AddView.vue'),
    meta: { title: 'Add Branch', requiresAuth: true },
  },
  {
    path: '/branches/edit/:id',
    name: 'BranchEdit',
    component: () => import('@/views/BranchUI/EditView.vue'),
    meta: { title: 'Edit Branch', requiresAuth: true },
  },
  {
    path: '/branches/profile/:id',
    name: 'BranchProfile',
    component: () => import('@/views/BranchUI/ProfileView.vue'),
    meta: { title: 'Branch Profile', requiresAuth: true },
  },

  // ─── System Configuration ──────────────────────────────────────────────
  {
    path: '/system-configuration',
    name: 'SystemConfiguration',
    component: () => import('@/views/SystemConfigurationUI/ListView.vue'),
    meta: { title: 'System Configuration', requiresAuth: true },
  },

  // ─── Treatments ────────────────────────────────────────────────────────
  {
    path: '/treatments',
    name: 'TreatmentsList',
    component: () => import('@/views/TreatmentUI/ListView.vue'),
    meta: { title: 'Treatments', requiresAuth: true },
  },
  {
    path: '/treatments/add',
    name: 'TreatmentAdd',
    component: () => import('@/views/TreatmentUI/AddView.vue'),
    meta: { title: 'Add Treatment', requiresAuth: true },
  },
  {
    path: '/treatments/edit/:id',
    name: 'TreatmentEdit',
    component: () => import('@/views/TreatmentUI/EditView.vue'),
    meta: { title: 'Edit Treatment', requiresAuth: true },
  },

  // ─── Purchase Orders ───────────────────────────────────────────────────
  {
    path: '/purchase-orders',
    name: 'PurchaseOrdersList',
    component: () => import('@/views/PurchaseOrderUI/ListView.vue'),
    meta: { title: 'Purchase Orders', requiresAuth: true },
  },
  {
    path: '/purchase-orders/add',
    name: 'PurchaseOrderAdd',
    component: () => import('@/views/PurchaseOrderUI/AddView.vue'),
    meta: { title: 'Create Purchase Order', requiresAuth: true },
  },
  {
    path: '/purchase-orders/edit/:id',
    name: 'PurchaseOrderEdit',
    component: () => import('@/views/PurchaseOrderUI/EditView.vue'),
    meta: { title: 'Edit Purchase Order', requiresAuth: true },
  },

  // ─── Availability ──────────────────────────────────────────────────────
  {
    path: '/availability',
    name: 'AvailabilityList',
    component: () => import('@/views/AvailabilityUI/ListView.vue'),
    meta: { title: 'Employee Availability', requiresAuth: true },
  },
  {
    path: '/availability/add',
    name: 'AvailabilityAdd',
    component: () => import('@/views/AvailabilityUI/AddView.vue'),
    meta: { title: 'Add Availability', requiresAuth: true },
  },
  {
    path: '/availability/detail/:id',
    name: 'AvailabilityDetail',
    component: () => import('@/views/AvailabilityUI/DetailView.vue'),
    meta: { title: 'Availability Details', requiresAuth: true },
  },
  {
    path: '/availability/edit/:id',
    name: 'AvailabilityEdit',
    component: () => import('@/views/AvailabilityUI/EditView.vue'),
    meta: { title: 'Edit Availability', requiresAuth: true },
  },

  // ─── Legacy redirects (singular → plural) ─────────────────────────────
  { path: '/department/add', redirect: { name: 'departmentAdd' } },
  { path: '/department/edit/:id', redirect: { name: 'departmentEdit' } },
  { path: '/employee/add', redirect: { name: 'EmployeeAdd' } },
  { path: '/employee/edit/:id', redirect: { name: 'EmployeeEdit' } },
  { path: '/ward/add', redirect: { name: 'WardAdd' } },
  { path: '/ward/edit/:id', redirect: { name: 'WardEdit' } },
  { path: '/patient/add', redirect: { name: 'PatientAdd' } },
  { path: '/patient/edit/:id', redirect: { name: 'PatientEdit' } },
  { path: '/designation/add', redirect: { name: 'designationAdd' } },
  { path: '/designation/edit/:id', redirect: { name: 'designationEdit' } },
  // ───────────────────────────────────────────────────────────────────────

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: NotFoundView,
    meta: {
      title: 'Not Found Page',
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 };
  },
});

const isTokenExpired = (): boolean => {
  const token = localStorage.getItem('hms-token');
  if (!token) return true;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    if (!payload.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

// Route to module mapping for permission checks
const routePermissionMap: Record<string, string> = {
  '/appointments': 'Appointments',
  '/patients': 'Patients',
  '/patient-bill': 'Patient Bills',
  '/wards': 'Wards',
  '/operation-theatre': 'Operation Theatre',
  '/surgery': 'Surgery',
  '/disease': 'Disease',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/designations': 'Designations',
  '/inventory': 'Inventory',
  '/permissions/roles': 'Role Permissions',
  '/permissions/employees': 'Employee Permissions',
  '/modules': 'Modules',
  '/permissions': 'Permissions',
  '/lab-tests': 'Lab Tests',
  '/branches': 'Branches',
  '/system-configuration': 'SystemConfiguration',
  '/lab-test': 'Lab Tests',
  '/roles': 'Roles',
  '/vendors': 'Vendors',
  '/admissions': 'Admissions',
  '/admissions/queue': 'Admissions',
  '/patient-surgeries': 'Patient Surgeries',
  '/treatments': 'Treatments',
  '/purchase-orders': 'Purchase Orders',
  '/availability': 'Availability',
};

const checkRoutePermission = (path: string): boolean => {
  // Always allow access to Dashboard, Profile, Settings, and Auth pages
  const publicRoutes = ['/', '/signin', '/profile', '/settings', '/patienthistoryforpatient'];
  if (publicRoutes.includes(path.toLowerCase())) {
    return true;
  }

  // Check if user is admin
  const isAdmin = localStorage.getItem('hms-is-admin') === 'true';
  const userStr = localStorage.getItem('hms-user');
  if (isAdmin || (userStr && JSON.parse(userStr).roles?.some((r: string) => r === 'Admin' || r === 'SuperAdmin' || r === 'System Administrator' || r === 'Hospital Administrator'))) {
    return true;
  }

  // Get stored permissions
  const permissionsStr = localStorage.getItem('hms-permissions');
  if (!permissionsStr) {
    return false;
  }

  try {
    const permissions = JSON.parse(permissionsStr);

    // Check if the route requires permission
    const moduleName = routePermissionMap[path];
    if (!moduleName) {
      // If route is not in the map, allow access (might be a sub-route)
      return true;
    }

    // Check if user has view permission for this module
    const permission = permissions.find((p: any) => p.name.toLowerCase() === moduleName.toLowerCase());

    return permission ? permission.isView || permission.isAdd || permission.isEdit || permission.isDelete : false;
  } catch {
    return false;
  }
};

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title ? to.meta.title + ' | ' : ''} HMS Dashboard`;

  const token = localStorage.getItem('hms-token');
  const tokenExpired = token ? isTokenExpired() : true;

  if (to.meta.requiresAuth && (!token || tokenExpired)) {
    // Clear expired token data
    if (tokenExpired && token) {
      localStorage.removeItem('hms-token');
      localStorage.removeItem('hms-user');
      localStorage.removeItem('hms-permissions');
      localStorage.removeItem('hms-is-admin');
    }
    next({ path: '/signin' });
  } else if (to.name === 'signin' && token && !tokenExpired) {
    next({ path: '/' });
  } else if (to.meta.requiresAuth && token && !tokenExpired) {
    // Check if user has permission to access this route
    const hasPermission = checkRoutePermission(to.path);
    if (!hasPermission) {
      // Redirect to dashboard if no permission
      next({ path: '/', replace: true });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
