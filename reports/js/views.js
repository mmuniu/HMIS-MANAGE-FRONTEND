
import Vue from "vue";
import ReportsIndex from "@reports/components/Index";
import DownloadToExcel from "@reports/components/DownloadToExcel";
import DownloadToPdf from "@reports/components/DownloadToPdf";
import DownloadToCsv from "@reports/components/DownloadToCsv";
import PatientMedicationReport from "@reports/components/patients/medication/PatientMedication";
import DepartmentalRevenueReport from "@reports/components/finance/department/Revenue";
import PatientDiagnosisReport from "@reports/components/evaluation/patient-diagnoses/Index";
import InsuranceFilter from "@reports/components/finance/insurance/InsuranceFilter";
import HypertensionReportFilter from "@reports/components/patients/hypertension/Filter";

import PosSalesReport from "@reports/components/finance/pos-sales/Index";
import DiscountTransactionsReport from "@reports/components/finance/discount-transactions/Index";
import WalkinReport from "@reports/components/revenue/WalkinReport";


Vue.component("reports-index", ReportsIndex);
/*a
 * Components for the patient contacts
 */
Vue.component("download-to-excel", DownloadToExcel);

Vue.component("download-to-pdf", DownloadToPdf);

Vue.component("download-to-csv", DownloadToCsv);

Vue.component("reports-patient-medication", PatientMedicationReport);

Vue.component("reports-department-revenue", DepartmentalRevenueReport);

Vue.component("reports-patient-diagnosis", PatientDiagnosisReport);

Vue.component("reports-insurance-filter", InsuranceFilter);

Vue.component("reports-hypertension-filter", HypertensionReportFilter);


Vue.component("pos-sales-report", PosSalesReport);

Vue.component("discount-transactions-report", DiscountTransactionsReport);

Vue.component("walkin-report", WalkinReport);
