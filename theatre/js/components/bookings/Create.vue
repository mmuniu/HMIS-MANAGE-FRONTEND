<template>

  <div>
      <v-row  >
          <v-col cols="12" sm="6" md="4">
              <v-select v-model="booking.theatre_deposit_id" label="Theatre Deposit" outline class="mr-3"
                        :items="deposits" item-text="name" item-value="id"
                        :error="errors.has('theatre_deposit_id')" :hint="errors.get('theatre_deposit_id')" persistent-hint @change="errors.clear('theatre_deposit_id')"
              ></v-select>
          </v-col>

          <v-col cols="12" sm="6" md="4">
              <v-select v-model="booking.requested_facility_id" label="Select a Facility to direct the request" outline class="mr-3"
                        :items="facilities" item-text="name" item-value="id"
                        :error="errors.has('requested_facility_id')" :hint="errors.get('requested_facility_id')" persistent-hint @change="errors.clear('requested_facility_id')"
              ></v-select>
          </v-col>

          <v-col cols="12" sm="6" md="4">
               <collabmed-date-time-picker
                  v-model="date"
                  dateOnly
                  :datetime="date"
                  label="Preferred Date">
              </collabmed-date-time-picker>
          </v-col>

          <v-col cols="12" sm="12" md="12">
              <v-switch :label="`Emergency? ${booking.emergency ? 'Yes' : 'No'}`" v-model="booking.emergency"></v-switch>
          </v-col>

          <v-col cols="12" sm="12" md="5">
              <procedure-search @results="procedureSelected"
                                categories="Theatre"
                                label="Search and select the operation procedure"
                                @resultCleared="clearSelectedProcedure">
              </procedure-search>
          </v-col>

          <v-col cols="1" md="1">
              <div class="mx-2">
                  <h4 class="grey--text">--OR--</h4>
              </div>
          </v-col>

          <v-col cols="12" sm="12" md="5">
              <!-- <package-search @input="packageSelected" @cleared="packageCleared"></package-search> -->
              <package-search ></package-search>
          </v-col>

          <v-col cols="12" sm="12" md="12">
              <v-textarea label="Reason" v-model="booking.reason" outline class="mr-3"
                          :error="errors.has('reason')" :hint="errors.get('reason')" persistent-hint @change="errors.clear('reason')"
              ></v-textarea>
          </v-col>

      </v-row>

      <v-row>
          <v-btn type="submit" class="blue lighten-1" color="blue" @click.prevent="save" block large
                 :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
          >
              <!-- {{ booking.visit_id ? 'Update Booking' : buttonText }} -->
              Place Booking
          </v-btn>
      </v-row>

      <br/>


  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Booking from "@theatre/libs/bookings/Booking";
import ProcedureSearch from "@evaluation/components/procedures/ProcedureSearch";
import PackageSearch from '@evaluation/components/setup/packages/PackageSearch';
import _ from "lodash";

export default {
  props: {
      visitId: {
          required: true,
      },

      buttonText: {
          type: String,
          default: "Place Booking",
      },
  },

  components: {
      ProcedureSearch,
      PackageSearch
  },

  data() {
      return {
          booking: new Booking,
          saveLoader: false,
          date: new Date().toISOString().substr(0, 10),
          menu: false,
          modal: false,
      };
  },

  computed: {
      ...mapGetters([
          "getTheatreDeposits", "getFacilities",
      ]),

      deposits() {
          return _.map(this.getTheatreDeposits.data, (item) => {
              return {
                  name: item.name + " (" + item.amount + ")",
                  id: item.id,
              };
          });
      },

      facilities() {
          return this.getFacilities.facilities;
      },

      errors() {
          return this.booking.form.errors;
      },

      submitted() {
          return this.booking.form.submitted;
      },

      contaminated() {
          return this.booking.form.errorDetected;
      },
  },

  watch: {
      contaminated(value) {
          if (value) {
              this.saveLoader = false;
              this.booking.form.errorDetected = false;
          }
      },

      submitted() {
          this.booking.form.submitted = false;
          this.saveLoader = false;

          if (this.booking.visit_id) {
              // an admission request exists
              this.$emit("saved");
          }
      },
  },

  methods: {
      ...mapActions([
          "setTheatreDeposits", "setFacilities",
      ]),

      packageSelected (val) {
          this.booking.package_id = val.id;
      },

      packageCleared () {
          this.booking.package_id = null;
      },

      procedureSelected(procedure) {
          if (procedure) {
              this.booking.operation_procedure = procedure.id;

              let ins_price;
              if (procedure.exclusion_price) {
                  ins_price = procedure.exclusion_price;
              } else {
                  ins_price = procedure.insurance_charge;
              }

              this.booking.proc_cash_price = procedure.cash_charge;
              this.booking.proc_ins_price = ins_price;
          }
      },

      clearSelectedProcedure() {
          this.booking.operation_procedure = null;
          this.booking.operation_procedure_price = null;
      },

      initialise() {
          this.setTheatreDeposits();
          this.setFacilities();
          this.booking.findForVisit(this.visitId);
      },

      save() {
          if (! this.booking.requested_facility_id) {
              alert("Please select a Facility to continue");
              return;
          }
          if (!this.booking.operation_procedure && !this.booking.package_id) {
              alert("Please select the operation procedure or package");
              return;
          }

          this.saveLoader = true;

          this.booking.visit_id = this.visitId;
          this.booking.preferred_date = this.date;
          // console.log(this.booking);
          this.booking.save();
      },
  },

  mounted() {
      this.initialise();
  },
};
</script>

<style scoped lang="scss">

</style>
