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
        <v-card-title class="headline  white--text cyan" primary-title>
          Book to Theatre

          <v-spacer></v-spacer>

          <v-btn icon dark @click.native="close" absolute right>
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text  class="px-5">
          <theatre-bookings-create
              :visit-id="visitId"
              @saved="update"
          ></theatre-bookings-create>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="primary" text @click="close">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },

    visitId: {
      required: true,
    },
  },

  data() {
    return {
      dialog: false,
      disabled: false,
    };
  },

  watch: {
    show(value) {
      this.dialog = value;
    },
  },

  methods: {
    close() {
      this.$emit("close");
    },

    update() {
      this.disabled = true;
      this.$emit("saved");
    },
  },

  mounted() {

  },
};
</script>

<style scoped lang="scss">

</style>
