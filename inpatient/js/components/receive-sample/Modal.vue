<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 2018-12-06
* Time: 14:24
* Project: platform
-->

<template>
  <div>
    <v-dialog v-model="dialog" width="70%" persistent>

      <v-card>
        <v-card-title class="text-h5  white--text teal" primary-title>
          Receive Sample

          <v-spacer></v-spacer>

          <v-btn icon dark @click.native="close" absolute right>
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text  class="px-5">
          <p><b>{{result.procedure_name}}</b></p>
         <p> Date: <b>{{ currentDateTime }}</b></p>

        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="primary"  @click="close">
            Close
          </v-btn>
          <v-btn color="primary"  @click="receive">
            Receive
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import InvestigationResults from '@evaluation/libs/investigation_results/InvestigationResults';

export default {
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        result: {
            required: true,
        },
    },

    data() {
        return {
            dialog: false,
            disabled: false,
            currentDateTime: '',
            investigationResult: new InvestigationResults(),

        };
    },

    watch: {
        show(value) {
            this.dialog = value;
        },
    },

    methods: {
        close() {
            this.$emit('close');
        },

        async receive() {
            this.disabled = true;
            this.loading = true;
            const response = await this.investigationResult.updateReceiveSampleStatus(this.result);

            if (response) {
                this.toggleReceiveSampleDialog = false;
                flash(response);

                this.loading = false;
            } else {
                flash({
                    message: 'Something wrong happened',
                    alert: 'error',
                });
            }
            this.$emit('saved');
        },
        getCurrentDateTime() {
            const date = new Date();
            const options = {
                weekday: 'long', year: 'numeric', month: 'long',
                day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
            };
            return date.toLocaleDateString('en-US', options);
        },
    },

    mounted() {
        this.currentDateTime = this.getCurrentDateTime();
    },
};
</script>

<style scoped lang="scss">

</style>
