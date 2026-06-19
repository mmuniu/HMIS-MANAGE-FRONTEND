<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h5 class="headline" style="font-weight: bold; text-decoration: underline">Next Steps History</h5>
      </v-col>
    </v-row>

    <v-row v-if="items">
      <!-- TCA -->
      <v-col cols="12" v-if="items.tca">
        <v-switch
            dense
            :input-value="items.tca.value"
            label="TCA"
            readonly
            style="font-weight: bold;"
        ></v-switch>

        <v-row v-if="items.tca.value">
          <v-col cols="5">
            <v-text-field
                label="Duration"
                :value="items.tca.duration ?? '-'"
                dense
                readonly
            />
          </v-col>
          <v-col cols="5">
            <v-text-field
                label="Duration in"
                :value="items.tca.duration_in ?? '-'"
                dense
                readonly
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- Call for follow-up -->
      <v-col cols="12">
        <v-switch
            dense
            :input-value="items.call_for_follow_up"
            label="Call for follow up"
            readonly
            style="font-weight: bold;"
        ></v-switch>
      </v-col>

      <!-- Refer to specialist -->
      <v-col cols="12" v-if="items.refer_to_specialist">
        <v-switch
            dense
            :input-value="items.refer_to_specialist.value"
            label="Refer to specialist"
            readonly
            style="font-weight: bold;"
        ></v-switch>

        <v-row v-if="items.refer_to_specialist.value">
          <v-col>
            <v-text-field
                :value="items.refer_to_specialist.specialist ?? '-'"
                dense
                readonly
                label="Specialist"
                style="font-weight: bold;"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- Other Next Steps -->
      <v-col cols="12">
        <v-switch
            dense
            :input-value="items.get_pre_authorization"
            label="Get pre-authorization"
            readonly
            style="font-weight: bold;"
        ></v-switch>
      </v-col>

      <v-col cols="12">
        <v-switch
            dense
            :input-value="items.book_for_theatre_la"
            label="Book for theatre LA"
            readonly
            style="font-weight: bold;"
        ></v-switch>
      </v-col>

      <v-col cols="12">
        <v-switch
            dense
            :input-value="items.book_for_theatre_ga"
            label="Book for theatre GA"
            readonly
            style="font-weight: bold;"
        ></v-switch>
      </v-col>

      <v-col cols="12">
        <v-switch
            dense
            :input-value="items.call_for_review"
            label="Call for review"
            readonly
            style="font-weight: bold;"
        ></v-switch>
      </v-col>

      <v-col cols="12">
        <v-switch
            dense
            :input-value="items.refer_for_investigation"
            label="Refer for investigation"
            readonly
            style="font-weight: bold;"
        ></v-switch>
      </v-col>
    </v-row>
    <v-alert v-else :value="true" type="info">
      No data found
    </v-alert>
  </div>
</template>

<script>
export default {
  name: "NextSteps",
  props: {
    items: {
      type: Object,
      required: true
    }
  }
};
</script>
