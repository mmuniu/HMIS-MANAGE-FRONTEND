<template>
  <div>
    <v-container id="dashboard" fluid tag="section">
      <collabmed-loading v-if="!foundWidgets"></collabmed-loading>
      <v-row v-else>
        <component v-for="(widget, index) in foundWidgets"
                   v-if="getComponent(widget)"
                   :key="index"
                   v-bind="widget['data']"
                   :covid-enabled="covidEnabled"
                   :is="getComponent(widget)">
        </component>
      </v-row>
    </v-container>
  </div>
</template>
<script>
/* eslint-disable quotes */
import Visits from "@evaluation/components/widgets/Visits.vue";
import TodayVisits from "@evaluation/components/widgets/TodayVisits.vue";
import ThisMonthVisits from "@evaluation/components/widgets/ThisMonthVisits.vue";
import PatientCount from "@reception/components/widgets/PatientCount.vue";
import ContactTracing from "@reception/components/widgets/ContactTracing.vue";
import AllUsers from "@users/components/widgets/AllUsers.vue";
import ActiveUsers from "@users/components/widgets/ActiveUsers.vue";
import VisitTrend from "@evaluation/components/widgets/VisitTrend.vue";
import FacilityVisits from "@evaluation/components/widgets/FacilityVisits";
import DailyVisitsTrend from "@evaluation/components/widgets/DailyVisitsTrend";
import PatientVisitsManagement from "@evaluation/components/widgets/PatientVisitsManagement";
import VisitsGraph from "@evaluation/components/widgets/VisitsGraph";
import TimeManager from "@evaluation/components/widgets/TimeManager.vue";

import DailySampleCollectionTrends from "@evaluation/components/widgets/DailySampleCollectionTrends";
import MonthlySampleCollectionTrends from "@evaluation/components/widgets/MonthlySampleCollectionTrends";
import RegionalSampleCollectionTrends from "@evaluation/components/widgets/RegionalSampleCollectionTrends";
import CovidPositiveCases from "@evaluation/components/widgets/CovidPositiveCases";
import CovidPositiveCasesPastSevenDays from "@evaluation/components/widgets/CovidPositiveCasesPastSevenDays";
import TotalHomeBasedCare from "@evaluation/components/widgets/TotalHomeBasedCare";
import CurrentHbcAdmissions from "@evaluation/components/widgets/CurrentHbcAdmissions";
import SubCountyGraph from "@evaluation/components/widgets/SubCountyGraph";
import CumulativeAdmissions from "@inpatient/components/widgets/CumulativeAdmissions";
import CurrentAdmissions from "@inpatient/components/widgets/CurrentAdmissions";
import TodayRevenue from "@finance/components/widgets/TodayRevenue";
import TotalRevenueThisWeek from "@finance/components/widgets/TotalRevenueThisWeek.vue";
import TotalRevenueThisMonth from "@finance/components/widgets/TotalRevenueThisMonth.vue";
import TotalRevenueThisYear from "@finance/components/widgets/TotalRevenueThisYear.vue";
import TotalExemptionsThisWeek from "@finance/components/widgets/TotalExemptionsThisWeek.vue";
import TotalWaiversThisWeek from "@finance/components/widgets/TotalWaiversThisWeek.vue";
import BasketValuePerMonth from "@finance/components/widgets/BasketValuePerMonth.vue";
import TopCategoriesByUnits from "@finance/components/widgets/TopCategoryByUnits.vue";
import TopCategoryByPrice from "@finance/components/widgets/TopCategoryByPrice.vue";

export default {
  props: {
    widgets: {
      type: String,
      required: true,
    },

    covid19Enabled: {
      type: String,
      default: '',
    },
  },

  components: {
    VisitTrend, Visits, TodayVisits, ThisMonthVisits, PatientCount, ContactTracing,
    AllUsers, ActiveUsers, FacilityVisits, DailyVisitsTrend, PatientVisitsManagement,
    DailySampleCollectionTrends, MonthlySampleCollectionTrends, RegionalSampleCollectionTrends,TimeManager,
    VisitsGraph, CovidPositiveCases, CovidPositiveCasesPastSevenDays, TotalHomeBasedCare, CurrentHbcAdmissions,
    CurrentAdmissions, CumulativeAdmissions, SubCountyGraph,TodayRevenue,TotalRevenueThisWeek,TotalRevenueThisMonth,
    TotalRevenueThisYear,TotalExemptionsThisWeek,TotalWaiversThisWeek, BasketValuePerMonth,TopCategoriesByUnits, TopCategoryByPrice
  },

  data: () => ({
    foundWidgets: null,
  }),

  computed: {
    covidEnabled() {
      if (this.covid19Enabled) {
        return true;
      }
      return false;
    },
  },

  methods: {
    getComponent(widget) {
      if (widget["module"] && widget['file_name']) {
        try {
          return widget['file_name'];
        } catch (e) {
          console.log(e);
        }
      }
    },
  },

  created() {

    this.foundWidgets = JSON.parse(this.widgets);
    console.log(this.foundWidgets)
  },
};
</script>
