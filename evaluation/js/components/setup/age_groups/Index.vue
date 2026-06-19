<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <div v-else>
    <v-card flat>
      <v-card-text>
        <create-age-group v-if="editing" :age-group-data="ageGroupData"></create-age-group>
        <create-age-group v-else></create-age-group>
      </v-card-text>
    </v-card>

    <v-card flat>
      <v-card-title class="text-bold grey--text text--darken-1">
        <span>List of all set up age groups</span>
        <v-spacer></v-spacer>
      </v-card-title>

      <v-divider class="my-0"></v-divider>

      <v-card-text>
        <v-data-table
            :headers="headers" :items="groups.data"
            class="mb-3" flat
        >
          <template v-slot:item.lower_value="{ item }">
            {{ item.lower_value }}  {{ item.lower_in }}
          </template>

          <template v-slot:item.upper_value="{ item }">
            {{ item.upper_value }}  {{ item.upper_in }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn class="mx-0 cyan" slot="activator" dark small @click="editGroup(item)">
              edit
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>

</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import CreateAgeGroup from './Create.vue';

export default {
  components: {
    CreateAgeGroup,
  },

  data: () => ({
    editing: false,
    ageGroupData: null,
    headers: [
      { text: 'Lower Value', value: 'lower_value' },
      { text: 'Upper Value', value: 'upper_value' },
      { text: 'Actions', value: 'actions' },
    ],
  }),

  computed: {
    ...mapGetters({
      groups: 'getAgeGroups',
    }),

    initialised() {
      return true;
    },
  },

  methods: {
    ...mapActions([
      'setAgeGroups',
    ]),

    editGroup(item) {
      this.editing =true;
      this.ageGroupData = item;
    },
  },

  mounted() {
    this.setAgeGroups();
  },
};
</script>
