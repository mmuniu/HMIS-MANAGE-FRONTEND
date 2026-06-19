<template>
  <div>


    <v-container fluid v-if="items.length > 0">
      <v-row v-for="(item, index) in items" :key="index" class="mb-4">
        <v-col cols="12">
          <h5 class="headline" style="font-weight: bold; text-decoration: underline">Outpatient Notes ( {{ item.user || '-' }} )</h5>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col md="6">
              <p style="font-weight: bold">Name</p>
            </v-col>
            <v-col md="6">
              <p style="font-weight: bold">Value</p>
            </v-col>
          </v-row>
          <v-row v-for="(note, noteIndex) in processNotes(item)" :key="noteIndex" class="py-1">
            <v-col cols="6">{{ note.name | snakeCaseToSentenceCaseCapitalizeWords }}</v-col>
            <v-col cols="6">{{ note.value }}</v-col>
          </v-row>
        </v-col>
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

  methods: {
    processNotes(item) {
      const notes = [];
      const clone = { ...item }; // Clone the object to avoid mutating props

      // Remove unnecessary keys
      delete clone['id'];
      delete clone['notesType'];
      delete clone['user_id'];
      delete clone['visit_id'];
      delete clone['visit'];

      // Add key-value pairs to the notes array
      for (const key in clone) {
        if (clone.hasOwnProperty(key)) {
          notes.push({ name: key, value: clone[key] });
        }
      }
      // Add special fields manually
      notes.push({ name: 'Recorded On', value: item.created_at });
      //notes.push({ name: 'Recorded By', value: item.user || '-' });
      return notes;
    },
  },
};
</script>


<style scoped>
</style>
