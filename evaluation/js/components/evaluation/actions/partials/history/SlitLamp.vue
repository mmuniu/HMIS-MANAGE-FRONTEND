<template>
  <div>
    <h5 class="headline" style="font-weight: bold; text-decoration: underline">
      Slit Lamp Exam
    </h5>

    <v-card>
      <v-card-title>
        <span>External Eye Exam</span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4">&nbsp;</v-col>
          <v-col cols="4" style="font-weight: bold"> OD WNL </v-col>
          <v-col cols="4" style="font-weight: bold"> OS WNL </v-col>
        </v-row>

        <template v-for="(exam, key) in slitLampCategories">
          <v-row :key="key">
            <v-col cols="4">
              <span class="ml-4" style="font-weight: bold">{{ exam.title }}</span>
            </v-col>
            <v-col cols="4">
              <!-- Join array values into a string, or display '-' if empty -->
              {{ formatValues(items?.[key]?.od_wnl) }}
            </v-col>
            <v-col cols="4">
              {{ formatValues(items?.[key]?.os_wnl) }}
            </v-col>
          </v-row>

          <!-- Check if there are "other" values and display them -->
          <v-row v-if="items?.[key]?.od_wnl_other || items?.[key]?.os_wnl_other">
            <v-col cols="4">
              <span class="ml-4" style="font-weight: bold">Other</span>
            </v-col>
            <v-col cols="4">
              {{ items?.[key]?.od_wnl_other || '-' }}
            </v-col>
            <v-col cols="4">
              {{ items?.[key]?.os_wnl_other || '-' }}
            </v-col>
          </v-row>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "SlitLamp",
  props: ["items"],
  data() {
    return {
      slitLampCategories: {
        eomm: { title: "EOMM" },
        stereopsis: { title: "Stereopsis" },
        cover_test: { title: "Cover test" },
        lids: { title: "Lids" },
        bulbar: { title: "Bulbar" },
        palperbral: { title: "Palperbral" },
        cornea: { title: "Cornea" },
        ac: { title: "Anterior Chamber (AC)" },
        lens: { title: "Lens" },
        vitreous: { title: "Vitreous" },
        cd_ratio: { title: "C/D Ratio" },
        appearance: { title: "Appearance" },
        nerve_fiber_layer: { title: "Nerve Fiber Layer" },
        macula: { title: "Macula" },
        periphery: { title: "Retinal Periphery" }
      },
    };
  },
  methods: {
    formatValues(value) {
      return Array.isArray(value) && value.length ? value.join(", ") : "-";
    }
  }
};
</script>

<style scoped>
.headline {
  margin-bottom: 10px;
}
</style>
