/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 22/09/2019
 * Time: 18:44
 */

/**
 * The component is the relative path to the component from the './components' folder.
 *
 * @type {{component: string, module: string, name: string}[]}
 */
export const list = [

    // evaluation
    { module: 'evaluation', name: 'patients-diagnoses', component: 'evaluation/patient-diagnoses/Index.vue' },
    { module: 'evaluation', name: 'moh-204A', component: 'evaluation/moh-204A/Index.vue' },
    { module: 'evaluation', name: 'moh-204B', component: 'evaluation/moh-204B/Index.vue' },
    { module: 'evaluation', name: 'moh-705A', component: 'evaluation/moh-705A/Index.vue' },
    { module: 'evaluation', name: 'moh-717', component: 'evaluation/moh-717/Index.vue' },
    { module: 'evaluation', name: 'moh-717-outpatient', component: 'evaluation/moh-717-outpatient/Index.vue' },
    { module: 'evaluation', name: 'moh-717-procedures', component: 'evaluation/moh-717-procedures/Index.vue' },
    { module: 'evaluation', name: 'moh-717-inpatient', component: 'evaluation/moh-717-inpatient/Index.vue' },
    { module: 'evaluation', name: 'moh-717-finance', component: 'evaluation/moh-717-finance/Index.vue' },
    { module: 'evaluation', name: 'moh-2025-physio', component: 'evaluation/moh-2025-physio/Index.vue' },
    { module: 'evaluation', name: 'visit-investigations', component: 'evaluation/visit-investigations/Index.vue' },
    { module: 'evaluation', name: '717', component: 'evaluation/mohreports/Moh705.vue' },
    { module: 'evaluation', name: 'presenting-complaints', component: 'evaluation/presenting-complaints/Index.vue' },
    { module: 'evaluation', name: 'idrs-respiratory', component: 'evaluation/idrs-respiratory/Index.vue' },
    { module: 'evaluation', name: 'procedure-diagnosis-analysis', component: 'evaluation/procedure-diagnosis-analysis/Index.vue' },
    { module: 'evaluation', name: 'patients-medication', component: 'evaluation/patients-medication/Index.vue' },
    { module: 'evaluation', name: 'procedures-performed', component: 'evaluation/procedures-performed/Index.vue' },
    { module: 'evaluation', name: 'hypertension-patients', component: 'evaluation/hypertension-patients/Index.vue' },
    { module: 'evaluation', name: 'departmental-procedures', component: 'evaluation/departmental-procedures/Index.vue' },
    { module: 'evaluation', name: 'departmental-visits', component: 'evaluation/departmental-visits/Index.vue' },
    { module: 'evaluation', name: 'patients-seen', component: 'evaluation/patients-seen/Index.vue' },
    { module: 'evaluation', name: 'clinician-performance', component: 'evaluation/clinician-performance/Index.vue' },
    { module: 'evaluation', name: 'inpatient-performance', component: 'evaluation/inpatient-performance/Index.vue' },
    { module: 'evaluation', name: 'result-analytics', component: 'evaluation/result-analytics/Index.vue' },
    { module: 'evaluation', name: 'collected-samples', component: 'evaluation/collected-samples/Index.vue' },
    { module: 'evaluation', name: 'radiology', component: 'evaluation/radiology/Index.vue' },
    { module: 'evaluation', name: 'lab-malaria-test', component: 'evaluation/lab-malaria-test/Index.vue' },
    { module: 'evaluation', name: 'radiology-and-lab-performance', component: 'evaluation/radiology-and-lab-performance/Index.vue' },
    { module: 'evaluation', name: 'theatre-monthly-performance', component: 'evaluation/theatre-monthly-performance/Index.vue' },
    { module: 'evaluation', name: 'pharmacy-prescriptions', component: 'evaluation/pharmacy-prescriptions/Index.vue' },
    { module: 'evaluation', name: 'lab-tat-report', component: 'evaluation/lab-tat-report/Index.vue' },
    { module: 'evaluation', name: 'outpatient-evaluation', component: 'evaluation/outpatient-evaluation/Index.vue' },
    { module: 'evaluation', name: 'maternity-report', component: 'evaluation/maternity-report/Index.vue' },

    /* reception*/
    { module: 'reception', name: 'patients-list', component: 'reception/patients-list/Index.vue' },
    { module: 'reception', name: 'patient-contacts', component: 'reception/patient-contacts/Index.vue' },
    { module: 'reception', name: 'chits-report', component: 'reception/chits-report/Index.vue' },
    { module: 'reception', name: 'test-game', component: 'reception/test-game/Index.vue' },

    // inpatient
    { module: 'inpatient', name: 'patient-admissions', component: 'inpatient/patient-admissions/Index.vue' },
    { module: 'inpatient', name: 'ward-admissions', component: 'inpatient/ward-admissions/Index.vue' },

    // inventory
    { module: 'inventory', name: 'stock-movement', component: 'inventory/stock-movement/Index.vue' },
    { module: 'inventory', name: 'purchase-report', component: 'inventory/purchase-report/Index.vue' },
    { module: 'inventory', name: 'stocks-expiry', component: 'inventory/stocks-expiry/Index.vue' },
    { module: 'inventory', name: 'stores-reports', component: 'inventory/stores-reports/Index.vue' },
    { module: 'inventory', name: 'suppliers-report', component: 'inventory/suppliers-report/Index.vue' },
    { module: 'inventory', name: 'supplier-list', component: 'inventory/supplier-list/Index.vue' },
    { module: 'inventory', name: 'stock-value', component: 'inventory/stock-value/Index.vue' },

    // finance
    { module: 'finance', name: 'revenues-income', component: 'finance/revenues-income/Index.vue' },
    { module: 'finance', name: 'revenues-income-information', component: 'finance/revenues-income/Details.vue' },
    { module: 'finance', name: 'walkin-reports', component: 'finance/walkin-reports/Index.vue' },
    { module: 'finance', name: 'cashier-collections', component: 'finance/cashier-collections/Index.vue' },
    { module: 'finance', name: 'cashier-summary', component: 'finance/cashier-summary/Index.vue' },
    { module: 'finance', name: 'waiver-report', component: 'finance/waiver-report/Index.vue' },
    { module: 'finance', name: 'invoice-report', component: 'finance/invoice-report/Index.vue' },
    { module: 'finance', name: 'cash-receipts-report', component: 'finance/cash-receipts-reports/Index.vue' },
    { module: 'finance', name: 'exemption-report', component: 'finance/exemption-report/Index.vue' },
    { module: 'finance', name: 'credit-note-report', component: 'finance/credit-note-report/Index.vue' },
    { module: 'finance', name: 'insurance-status', component: 'finance/insurance-status/Index.vue' },
    { module: 'finance', name: 'drugs-dispensed', component: 'finance/drugs-dispensed/Index.vue' },
    { module: 'finance', name: 'insurance-summary', component: 'finance/insurance-summary/Index.vue' },
    { module: 'finance', name: 'clinician-summary', component: 'finance/clinician-summary/Index.vue' },
    { module: 'finance', name: 'revenue-summary-income', component: 'finance/revenue-summary-income/Index.vue' },
    { module: 'finance', name: 'assign-user', component: 'finance/assign-user/Index.vue' },
    { module: 'finance', name: 'shop-report', component: 'finance/shop-report/Index.vue' },
    { module: 'finance', name: 'cash-summary', component: 'finance/cash-summary/Index.vue' },
    { module: 'finance', name: 'ward-revenue', component: 'finance/ward-revenue/Index.vue' },
    { module: 'finance', name: 'inpatient-revenue', component: 'finance/inpatient-revenue/Index.vue' },
    { module: 'finance', name: 'lab-performance', component: 'finance/lab-performance/Index.vue' },
    { module: 'finance', name: 'radiology-performance', component: 'finance/radiology-performance/Index.vue' },
    { module: 'finance', name: 'lost-sales', component: 'finance/lost-sales/Index.vue' },

    // other reports
    { module: 'evaluation', name: 'facility-summary', component: 'evaluation/facility-summary/Index.vue' },

];
