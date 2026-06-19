
import Vue from 'vue';
import ServiceChargesIndex from '@finance/components/service_charges/Index';
import ServiceChargesCreate from '@finance/components/service_charges/Create';
import ServiceChargesEdit from '@finance/components/service_charges/Edit';
import ServiceChargesShow from '@finance/components/service_charges/Show';
import SchemeCharges from '@finance/components/service_charges/AttachScheme';
import PatientSignature from '@finance/components/signatures/PatientSignature';
import PatientInformation from '@finance/components/PatientInformation';
import CashPaymentsIndex from '@finance/components/cash_payments/Index';
import CashPaymentsReceive from '@finance/components/cash_payments/Receive';
import CashPaymentListing from '@finance/components/cash_payments/CashPaymentsListing';
import PatientAccounts from '@finance/components/patient_accounts/Index';
import BillExtraItems from '@finance/components/BillExtraItems';
import EditInvoiceDetails from '@finance/components/EditInvoiceDetails';
import CreditNotesIndex from '@finance/components/cash_payments/CreditNotes/Index';
import FacilityVisitsGraph from '@finance/components/graphs/visits_facility/Index';
import SplitPatientBill from '@finance/components/SplitPatientBill';
import ShowInvoices from '@finance/components/invoices/partials/Base';
import InsuranceBillApproval from '@finance/components/invoices/partials/InsuranceBillApproval';
import CompanyStatements from '@finance/components/invoices/company-statements/Index';
import InsuranceCompanyAccount from '@finance/components/insurance-account/Index';
import InvoiceDispatches from '@finance/components/invoices/partials/Dispatches';
import InsurancePayments from '@finance/components/invoices/InsurancePayment';
import InsurancePaid from '@finance/components/invoices/InsurancePaid';
import ApprovedAmounts from '@finance/components/invoices/partials/ApprovedAmounts';
import FinanceCashOuts from '@finance/components/cash-outs/CashOuts';
import CashPaymentForm from '@finance/components/cash_payments/partials/CashPaymentForm';
import CashInvoicesFilter from "@finance/components/cash-invoices/Filter";
import WaiverForm from '@finance/components/invoices/WaiverForm';
import CreateInvoice from '@finance/components/invoices/CreateInvoice';
import InvestigationMode from '@finance/components/invoices/InvestigationMode';
import VoucherManagement from './components/vouchers/VoucherManagement.vue';


/*
 * Dialysis plants
 */
Vue.component('finance-service-charges-index', ServiceChargesIndex);
Vue.component('finance-service-charges-create', ServiceChargesCreate);
Vue.component('finance-service-charges-edit', ServiceChargesEdit);
Vue.component('finance-service-charges-show', ServiceChargesShow);
Vue.component('finance-scheme-charges', SchemeCharges);

/*
 * Signatures
 */
Vue.component('finance-patient-signature', PatientSignature);


/*
 * Create invoice
 */
Vue.component('finance-create-invoice', CreateInvoice);
Vue.component('investigation-mode', InvestigationMode);


/*
Patient info
 */
Vue.component('finance-patient-information', PatientInformation);

/*
* cash payments
*/
Vue.component('finance-cash-payments', CashPaymentsIndex);
Vue.component('finance-cash-payments-receive', CashPaymentsReceive);
Vue.component('finance-cash-payments-listing', CashPaymentListing);
Vue.component('patients-accounts', PatientAccounts);
Vue.component('finance-cash-payment-form', CashPaymentForm);

/*
* bill other items (add items to visit (investigations, etc))
* */
Vue.component('finance-add-extra-items-to-visit-bills', BillExtraItems);
/*
* edit invoice details
* */
Vue.component('finance-edit-invoice-details', EditInvoiceDetails);
Vue.component('finance-credit-notes-index', CreditNotesIndex);
/*
*graphs
* */
Vue.component('facility-visits-graph', FacilityVisitsGraph);

/*
* split patient bill
* */
Vue.component('finance-split-patient-bill', SplitPatientBill);
/*
* invoices
* */
Vue.component('finance-show-invoices', ShowInvoices);
Vue.component('finance-company-statements', CompanyStatements);
Vue.component('finance-insurance-payments', InsurancePayments);
Vue.component('finance-insurance-paid', InsurancePaid);
Vue.component('finance-insurance-approved-amounts', ApprovedAmounts);
Vue.component('finance-insurance-approval-dialog', InsuranceBillApproval);

/*
* insurance company account
* */
Vue.component('finance-insurance-company-account', InsuranceCompanyAccount);

/*
* dispatches
* */
Vue.component('finance-invoice-dispatches-list', InvoiceDispatches);
/*
* cash outs
* */
Vue.component('finance-cash-outs', FinanceCashOuts);

/**
 * cash invoices
 */
Vue.component('finance-cash-invoices-filter', CashInvoicesFilter)

Vue.component('finance-waiver-form', WaiverForm)

Vue.component('voucher-management', VoucherManagement)



