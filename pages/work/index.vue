<script setup lang="ts">
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h4 font-weight-semibold">Bugs &amp; Features</h2>
      <p class="textSecondary">Bugs and features assigned to you to work on.</p>
    </div>

    <v-card rounded="lg" elevation="10">
      <v-card-text class="text-center py-12">
        <v-avatar color="error" variant="tonal" size="64" class="mb-4">
          <v-icon icon="mdi-bug-outline" size="36" />
        </v-avatar>
        <h3 class="text-h6 mb-2">Nothing assigned yet</h3>
        <p class="textSecondary mb-0">
          Bugs and features assigned to you will show up here.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>
