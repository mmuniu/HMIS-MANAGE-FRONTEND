
const portal = '/reception/:patientId/portal';
const customerPortal = '/reception/:customerId/portal';

import PatientDetails from '@reception/components/patients/portal/partials/PatientDetails';
import CustomerDetails from '@reception/components/customers/portal/partials/CustomerDetails';
import PortalVisits from '@reception/components/customers/portal/partials/Visits';
import FinanceOverview from '@reception/components/customers/portal/partials/FinanceOverview';
import Deposits from '@reception/components/customers/portal/partials/Deposits';
import Withdrawals from '@reception/components/customers/portal/partials/Withdrawals';
import CashPayments from '@reception/components/customers/portal/partials/CashPayments';
import InvoicePayments from '@reception/components/customers/portal/partials/InvoicePayments';
import Waivers from '@reception/components/customers/portal/partials/Waivers';

import Investigations from '@reception/components/patients/portal/partials/Investigations';
import Vitals from '@reception/components/patients/portal/partials/Vitals';

export const reception = [
    // Patient portal routes
    { path: `${portal}/details`, component: PatientDetails },
    { path: `${portal}/investigations`, component: Investigations },
    { path: `${portal}/vitals`, component: Vitals },

    // Customer portal routes
    { path: `${customerPortal}/customer-details`, component: CustomerDetails },
    { path: `${customerPortal}/visits`, component: PortalVisits },
    { path: `${customerPortal}/finance-overview`, component: FinanceOverview },
    { path: `${customerPortal}/deposits`, component: Deposits },
    { path: `${customerPortal}/withdrawals`, component: Withdrawals },
    { path: `${customerPortal}/cash-payments`, component: CashPayments },
    { path: `${customerPortal}/invoice-payments`, component: InvoicePayments },
    { path: `${customerPortal}/waivers`, component: Waivers }
];
