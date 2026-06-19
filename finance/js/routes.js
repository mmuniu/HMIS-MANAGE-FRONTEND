
/*
* finance routing
* */

const financeInvoicing = "/finance/invoices";
const insuranceAccount = "/finance/insurance-company/:insuranceId/account";

import PendingInvoices from "./components/invoices/Pending";
import ManualInvoices from "./components/invoices/ManualInvoice";
import BilledInvoices from "./components/invoices/Billed";
import CancelledInvoices from "./components/invoices/Cancelled";
import DispatchedInvoices from "./components/invoices/Dispatched";
import InsurancePayment from "./components/invoices/InsurancePayment";
import InsurancePaid from "./components/invoices/InsurancePaid";

import InsuranceAccountInvoices from "./components/insurance-account/Invoices";
import InsuranceAccountDispatched from "./components/insurance-account/Dispatched";
import InsuranceAccountPayments from "./components/insurance-account/InsurancePayments";
import SettlementExcelUploadReports from "./components/insurance-account/SettlementExcelUploadReports";
import InsuranceAccountPaid from "./components/insurance-account/InsurancePaid";
import InsuranceAccountSummary from "./components/insurance-account/SummaryAndAnalytics";

export const finance = [

    /*
     * finance invoice management routes
     */
    { path: `${financeInvoicing}/pending`, component: PendingInvoices },
    { path: `${financeInvoicing}/manual-invoice`, component: ManualInvoices },
    { path: `${financeInvoicing}/billed`, component: BilledInvoices },
    { path: `${financeInvoicing}/cancelled`, component: CancelledInvoices },
    { path: `${financeInvoicing}/dispatched`, component: DispatchedInvoices },
    { path: `${financeInvoicing}/insurance-payment`, component: InsurancePayment },
    { path: `${financeInvoicing}/insurance-paid`, component: InsurancePaid },

    /*
    * insurance company accounts
    * */
    { path: `${insuranceAccount}/billed-invoices`, component: InsuranceAccountInvoices },
    { path: `${insuranceAccount}/dispatched-invoices`, component: InsuranceAccountDispatched },
    { path: `${insuranceAccount}/insurance-payments`, component: InsuranceAccountPayments },
    { path: `${insuranceAccount}/excel-upload-statuses`, component: SettlementExcelUploadReports },
    { path: `${insuranceAccount}/insurance-paid`, component: InsuranceAccountPaid },
    { path: `${insuranceAccount}/summary`, component: InsuranceAccountSummary },
];
