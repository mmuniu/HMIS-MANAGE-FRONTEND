<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTesterActivityStore } from '@/stores/testerActivity'

const store = useTesterActivityStore()

onMounted(() => store.load())

const t = computed(() => store.data)

function fmtDate(iso: string | null): string {
  if (!iso) return 'Never'
  const d = new Date(iso)
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const headers = [
  { title: 'Tester', key: 'name', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Passed', key: 'pass', sortable: true, align: 'end' as const },
  { title: 'Failed', key: 'fail', sortable: true, align: 'end' as const },
  { title: 'Untested', key: 'untested', sortable: true, align: 'end' as const },
  { title: 'Pass rate', key: 'pass_rate', sortable: true },
  { title: 'Authored', key: 'authored', sortable: false, align: 'end' as const },
  { title: 'Last active', key: 'last_active_at', sortable: true },
]

// Flatten for the data table.
const rows = computed(() =>
  (t.value?.testers ?? []).map((x) => ({
    ...x,
    pass: x.verdicts.pass,
    fail: x.verdicts.fail,
    untested: x.verdicts.untested,
  })),
)

const verdictColor = (v: string) => (v === 'pass' ? 'success' : v === 'fail' ? 'error' : 'grey')
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h4 font-weight-semibold">Tester Activity</h2>
      <p class="textSecondary">Track how testers and QA are creating, running, and passing/failing tests.</p>
    </div>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" :text="store.error" />
    <v-progress-linear v-if="store.loading" indeterminate color="primary" class="mb-4" />

    <template v-if="t">
      <!-- Summary totals -->
      <v-row class="mb-2">
        <v-col cols="6" md="3">
          <v-card rounded="lg" elevation="10"><v-card-text>
            <p class="text-overline textSecondary mb-0">Testers</p>
            <p class="text-h4 font-weight-semibold mb-0">{{ t.totals.testers }}</p>
          </v-card-text></v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card rounded="lg" elevation="10"><v-card-text>
            <p class="text-overline textSecondary mb-0">QA</p>
            <p class="text-h4 font-weight-semibold mb-0">{{ t.totals.qa }}</p>
          </v-card-text></v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card rounded="lg" elevation="10"><v-card-text>
            <p class="text-overline textSecondary mb-0">Passed</p>
            <p class="text-h4 font-weight-semibold text-success mb-0">{{ t.totals.pass }}</p>
          </v-card-text></v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card rounded="lg" elevation="10"><v-card-text>
            <p class="text-overline textSecondary mb-0">Failed</p>
            <p class="text-h4 font-weight-semibold text-error mb-0">{{ t.totals.fail }}</p>
          </v-card-text></v-card>
        </v-col>
      </v-row>

      <!-- Per-tester table -->
      <v-card rounded="lg" elevation="10" class="mb-6">
        <v-card-item><v-card-title>Per-tester breakdown</v-card-title></v-card-item>
        <v-data-table :headers="headers" :items="rows" :items-per-page="25" density="comfortable" hover>
          <template #item.name="{ item }">
            <div class="py-1">
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption textSecondary">{{ item.email }}</div>
            </div>
          </template>
          <template #item.role="{ item }">
            <v-chip :color="item.role === 'tester' ? 'primary' : 'warning'" size="small" variant="tonal" label>
              {{ item.role === 'tester' ? 'Tester' : 'QA' }}
            </v-chip>
          </template>
          <template #item.pass="{ item }"><span class="text-success font-weight-medium">{{ item.pass }}</span></template>
          <template #item.fail="{ item }"><span class="text-error font-weight-medium">{{ item.fail }}</span></template>
          <template #item.untested="{ item }"><span class="textSecondary">{{ item.untested }}</span></template>
          <template #item.pass_rate="{ item }">
            <div style="min-width: 120px">
              <v-progress-linear :model-value="item.pass_rate" height="8" rounded
                :color="item.pass_rate >= 80 ? 'success' : item.pass_rate >= 50 ? 'warning' : 'error'" />
              <span class="text-caption textSecondary">{{ item.pass_rate }}%</span>
            </div>
          </template>
          <template #item.authored="{ item }">
            <span v-if="item.can_author">{{ item.authored.suites }} suites · {{ item.authored.cases }} cases</span>
            <span v-else class="textSecondary">—</span>
          </template>
          <template #item.last_active_at="{ item }">
            <span class="text-caption">{{ fmtDate(item.last_active_at) }}</span>
          </template>
          <template #no-data>
            <div class="pa-8 text-center textSecondary">No testers yet.</div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Recent activity feed -->
      <v-card rounded="lg" elevation="10">
        <v-card-item>
          <v-card-title>Recent activity</v-card-title>
          <v-card-subtitle>The latest pass/fail verdicts across all testers.</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-list v-if="t.recent.length" lines="two" density="comfortable">
            <v-list-item v-for="r in t.recent" :key="r.id">
              <template #prepend>
                <v-avatar :color="verdictColor(r.verdict)" variant="tonal" size="36">
                  <v-icon :icon="r.verdict === 'pass' ? 'mdi-check' : 'mdi-close'" />
                </v-avatar>
              </template>
              <v-list-item-title>
                <span class="font-weight-medium">{{ r.user }}</span>
                marked <v-chip :color="verdictColor(r.verdict)" size="x-small" variant="tonal" label>{{ r.verdict.toUpperCase() }}</v-chip>
                on <span class="font-weight-medium">{{ r.case_id }}</span>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ r.suite }} — {{ r.case_title }}<template v-if="r.note"> · “{{ r.note }}”</template>
              </v-list-item-subtitle>
              <template #append>
                <span class="text-caption textSecondary">{{ fmtDate(r.at) }}</span>
              </template>
            </v-list-item>
          </v-list>
          <p v-else class="textSecondary">No test activity recorded yet.</p>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>
