<script setup lang="ts">
import { computed } from 'vue'
import type { TenantRegistration } from '@/composables/useExternalPlatformsApi'

// What a platform sent when it asked for one of its tenants to be set up here
// (tenants.register) — for whoever approves it: they set up the hospital from
// these details, then map the tenant to it and make it active.

const props = defineProps<{
  registration: TenantRegistration
  requestedAt: string | null
  platformName: string
}>()

const r = computed(() => props.registration)

// The organization's details, in the order someone setting up a hospital needs them.
const rows = computed(() => [
  { label: 'Name', value: r.value.name },
  { label: 'Legal name', value: r.value.legal_name },
  { label: 'Registration number', value: r.value.registration_number },
  { label: 'Email', value: r.value.email, href: r.value.email ? `mailto:${r.value.email}` : undefined },
  { label: 'Phone', value: r.value.phone, href: r.value.phone ? `tel:${r.value.phone}` : undefined },
  { label: 'Address', value: r.value.address },
  { label: 'County', value: r.value.county },
  { label: 'Country', value: r.value.country },
].filter(row => row.value))

const contact = computed(() => {
  const c = r.value.contact_person
  return c && (c.name || c.email || c.phone) ? c : null
})

const facilities = computed(() => r.value.facilities ?? [])
</script>

<template>
  <v-sheet rounded="lg" border class="pa-4 request-details">
    <div class="d-flex flex-wrap align-center ga-2 mb-3">
      <v-icon icon="mdi-inbox-arrow-down" color="warning" size="small" />
      <span class="text-subtitle-2 font-weight-semibold">Requested by {{ platformName }}</span>
      <span v-if="requestedAt" class="text-caption textSecondary">on {{ new Date(requestedAt).toLocaleString() }}</span>
    </div>

    <dl class="details mb-0">
      <template v-for="row in rows" :key="row.label">
        <dt class="text-caption textSecondary">{{ row.label }}</dt>
        <dd class="text-body-2">
          <a v-if="row.href" :href="row.href">{{ row.value }}</a>
          <template v-else>{{ row.value }}</template>
        </dd>
      </template>

      <template v-if="contact">
        <dt class="text-caption textSecondary">Contact person</dt>
        <dd class="text-body-2">
          {{ contact.name || '—' }}
          <span v-if="contact.email"> · <a :href="`mailto:${contact.email}`">{{ contact.email }}</a></span>
          <span v-if="contact.phone"> · <a :href="`tel:${contact.phone}`">{{ contact.phone }}</a></span>
        </dd>
      </template>

      <template v-if="facilities.length">
        <dt class="text-caption textSecondary">Facilities ({{ facilities.length }})</dt>
        <dd class="text-body-2">
          <ul class="facility-list">
            <li v-for="(f, i) in facilities" :key="i">
              {{ f.name }}
              <span v-if="f.mfl_code" class="textSecondary"> · MFL {{ f.mfl_code }}</span>
              <span v-if="f.county" class="textSecondary"> · {{ f.county }}</span>
            </li>
          </ul>
        </dd>
      </template>

      <template v-if="r.notes">
        <dt class="text-caption textSecondary">Notes</dt>
        <dd class="text-body-2 notes">{{ r.notes }}</dd>
      </template>
    </dl>
  </v-sheet>
</template>

<style scoped>
.request-details {
  background: rgba(var(--v-theme-warning), 0.04);
}
.details {
  display: grid;
  grid-template-columns: minmax(120px, max-content) 1fr;
  column-gap: 16px;
  row-gap: 6px;
  align-items: baseline;
}
.details dd {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
}
.facility-list {
  margin: 0;
  padding-left: 18px;
}
.notes {
  white-space: pre-line;
}
@media (max-width: 480px) {
  .details {
    grid-template-columns: 1fr;
    row-gap: 2px;
  }
  .details dd {
    margin-bottom: 6px;
  }
}
</style>
