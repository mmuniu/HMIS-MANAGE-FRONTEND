<!-- Administer drugs modal -->
<template>
  <v-dialog v-model="dialog" width="600" persistent>
    <v-card>
      <v-card-title class="text-h5  white--text blue" primary-title>
        <span class="font-weight-bold white--text">Administer Drugs</span>
        <v-spacer></v-spacer>
        <v-btn icon dark @click.native="dialog = false" absolute right>
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text  class="px-5">
        <inpatient-prescriptions-administer-drugs :prescriptions="prescriptions"></inpatient-prescriptions-administer-drugs>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import AdministerDrugs from '@inpatient/libs/prescriptions/AdministerDrugs';

export default {
    props: {
        visitId: {
            default: null,
            type: Number,
        },

        prescriptions: {
            default:null
        },
        showAdministerDrugsModal: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        dialog: true,

    }),
    watch: {
      dialog(val) {
        if (!val) {
          this.$emit('close'); // Emit custom event when dialog is closed
        }
      },
    },
    methods: {

        // closeAdministerDrugsModal() {
        //     this.showAdministerDrugsModal = false;
        //     this.$emit('close-administer-drugs');
        // },

    },
};
</script>
