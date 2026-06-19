
import Vue from "vue";
import SettingsInsuranceRebatesIndex from "@settings/components/rebates/Index";
import SettingsSchemeExclusions from "@settings/components/schemes/Exclusions";
import SettingsSchemeExclusionsProcedures from "@settings/components/schemes/exclusions/ProcedureExclusions";
import SettingsSchemeExclusionsProducts from "@settings/components/schemes/exclusions/ProductsExclusions";
import SettingsPartnerInstitutionsIndex from "@settings/components/partner_institutions/Index";
import SettingsPartnerInstitutionsCreate from "@settings/components/partner_institutions/Create";
import SettingsPartnerInstitutionsStaff from "@settings/components/partner_institutions/Staff";
import PartnerInstitutionStaffSearch from "@settings/components/partner_institutions/PartnerInstitutionStaffSearch";
import SettingsSchemesIndex from "@settings/components/schemes/Index";
import SettingsSchemesSearch from "@settings/components/schemes/SchemesSearch";
import SettingsOrganizationIndex from "@settings/components/organization/Index";
import SettingsDepartmentIndex from "@settings/components/departments/Index";
import SettingsRegionsIndex from "@settings/components/regions/Index";
import SettingsPosSetup from "@settings/components/pos/Index";
import SettingsRegistrationSetup from  "@settings/components/registration/Index";

/**
 rebates
 */

Vue.component("settings-insurance-rebates-index", SettingsInsuranceRebatesIndex);

/*
 * exclusions
 */
Vue.component("settings-scheme-exclusions", SettingsSchemeExclusions);
Vue.component("settings-scheme-exclusions-procedures", SettingsSchemeExclusionsProcedures);
Vue.component("settings-scheme-exclusions-products", SettingsSchemeExclusionsProducts);

/*
* partner institutions
* */
Vue.component("settings-partner-institutions-index", SettingsPartnerInstitutionsIndex);
Vue.component("settings-partner-institutions-create", SettingsPartnerInstitutionsCreate);
Vue.component("settings-partner-institution-staff", SettingsPartnerInstitutionsStaff);

/*
* search partner institution staff
* */
Vue.component("partner-institution-staff-search", PartnerInstitutionStaffSearch);

/*
* schemes
* */
Vue.component("settings-schemes-index", SettingsSchemesIndex);
Vue.component("settings-schemes-search", SettingsSchemesSearch);
/*
* organization setup and practices
* */
Vue.component("settings-organization-index", SettingsOrganizationIndex);
/*
* departments
* */
Vue.component("settings-departments-index", SettingsDepartmentIndex);

/*
* regions
* */
Vue.component("settings-regions-index", SettingsRegionsIndex);
/*
* pos
* */

Vue.component('settings-pos-setup', SettingsPosSetup);
Vue.component('settings-registration-setup', SettingsRegistrationSetup);
