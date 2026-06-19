<template>
  <div>
    <h5 class="headline" style="font-weight: bold; text-decoration: underline">Doctor's Notes</h5>

    <v-container fluid  v-if="list">
      <v-row >
        <v-col md="6">
          <p style="font-weight: bold">Name</p>
        </v-col>
        <v-col md="6">
          <p style="font-weight: bold">Value</p>
        </v-col>
      </v-row>

      <v-row  v-for="item in list" :key="item.name" class="py-1">
        <v-col cols="6">{{ item.name | snakeCaseToSentenceCaseCapitalizeWords }}</v-col>
        <v-col cols="6">{{ item.value }}</v-col>
      </v-row>
    </v-container>

    <v-alert v-else :value="true" type="info">
      No data found
    </v-alert>
  </div>

</template>

<script>
export default {
  props: ['items'],

  data() {
    return {
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Value', value: 'value' },
      ],
    };
  },

  computed: {
    list() {
      if (! this.items) {
        return null;
      }

      const notes = [];
      const clone = Object.assign({}, this.items);
      delete clone['id'];
      delete clone['doctor_id'];
      delete clone['user_id'];
      delete clone['visit_id'];
      delete clone['created_at'];

      for (const key in clone) {
        if (clone.hasOwnProperty(key)) {
          notes.push({ 'name': key, 'value': clone[key] });
        }
      }

      return notes;
    },
  },
};
</script>

<style scoped>
</style>
