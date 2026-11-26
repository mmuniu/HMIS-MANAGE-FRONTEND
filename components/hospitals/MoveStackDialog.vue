<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useHospitalsApi } from '@/composables/useHospitalsApi'
import type { StackMovePreview, StackMoveRecord, StackMoveResult, V3Target } from '@/types/hospital'

// "Move to another stack" on the hospital page. Re-provisions the hospital
// on the chosen v3 stack (organization, facilities, admin accounts) and
// switches it over — see HospitalStackMover on the backend. Clinical data
// is NOT moved; the preview spells out everything that isn't.

const props = defineProps<{ orgId: string; hospitalName: string; currentTarget: string }>()
const emit = defineEmits<{ moved: [] }>()
const open = defineModel<boolean>({ required: true })

const api = useHospitalsApi()
const { $showToast } = useNuxtApp()

const targets = ref<V3Target[]>([])
const history = ref<StackMoveRecord[]>([])
const target = ref<string | null>(null)
const preview = ref<StackMovePreview | null>(null)
const loadingPreview = ref(false)

const reason = ref('')
const confirmName = ref('')
const existingCoreOrgId = ref('')
const deactivateOld = ref(false)
const seed = ref(true)
const showAdvanced = ref(false)

const moving = ref(false)
const error = ref('')
const result = ref<StackMoveResult | null>(null)

const choices = computed(() => targets.value.filter((t) => t.key !== props.currentTarget))
const nameMatches = computed(() => confirmName.value.trim().toLowerCase() === props.hospitalName.trim().toLowerCase())
const canMove = computed(() =>
  !!preview.value && preview.value.blockers.length === 0 && reason.value.trim().length >= 10 && nameMatches.value && !moving.value,
)

watch(open, async (isOpen) => {
  if (!isOpen) {
    if (result.value) emit('moved')
    return
  }
  target.value = null
  preview.value = null
  reason.value = ''
  confirmName.value = ''
  existingCoreOrgId.value = ''
  deactivateOld.value = false
  seed.value = true
  showAdvanced.value = false
  error.value = ''
  result.value = null
  try {
    const [t, h] = await Promise.all([api.getV3Targets(), api.getStackMoves(props.orgId)])
    targets.value = t
    history.value = h
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Could not load the stacks.'
  }
})

watch(target, async (key) => {
  preview.value = null
  if (!key) return
  loadingPreview.value = true
  try {
    preview.value = await api.previewMoveStack(props.orgId, key)
    seed.value = true
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Could not prepare the move.'
  } finally {
    loadingPreview.value = false
  }
})

async function move() {
  if (!canMove.value || !target.value) return
  moving.value = true
  error.value = ''
  try {
    result.value = await api.moveStack(props.orgId, {
      target: target.value,
      reason: reason.value.trim(),
      confirm_name: confirmName.value.trim(),
      existing_core_org_id: existingCoreOrgId.value.trim() || null,
      deactivate_old_admins: deactivateOld.value,
      seed: seed.value,
    })
    $showToast(`Moved to ${result.value.data.v3_target_label}.`)
    // The parent reloads the hospital on "Done" (see watch(open) below), not
    // now: reloading would re-render the page under the dialog while the
    // one-time admin passwords are still on screen.
  } catch (e: any) {
    const d = e?.response?.data
    const fieldErrors = d?.errors ? Object.values(d.errors).flat().join(' ') : ''
    error.value = [fieldErrors || d?.message || 'The move failed.', d?.core_provisioning_error].filter(Boolean).join(' — ')
  } finally {
    moving.value = false
  }
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    $showToast('Copied.')
  } catch {
    $showToast('Could not copy.')
  }
}

const needsFollowUp = computed(() => !!result.value && (
  result.value.facilities.some((f) => !f.core_facility_id) || result.value.admins.some((a) => a.error)
))

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <v-dialog v-model="open" max-width="680" scrollable :persistent="moving || !!result">
    <v-card rounded="lg">
      <v-card-title class="text-h6 pt-5 px-5">Move to another stack</v-card-title>

      <!-- ── Result ─────────────────────────────────────────────────────── -->
      <v-card-text v-if="result" class="px-5">
        <v-alert type="success" variant="tonal" class="mb-4"
          :title="`Now on ${result.data.v3_target_label}`"
          :text="`New organization ID: ${result.data.core_org_id}. The old organization (${result.move.from_core_org_id ?? '—'}) is still on ${result.move.from.label}.`" />

        <div class="text-subtitle-2 mb-1">Facilities</div>
        <div v-for="f in result.facilities" :key="f.id" class="d-flex justify-space-between text-body-2 py-1">
          <span>{{ f.name }}</span>
          <span v-if="f.core_facility_id" class="font-mono">{{ f.core_facility_id }}</span>
          <span v-else class="text-error">Not created — use “Provision facility” on the hospital page</span>
        </div>

        <div class="text-subtitle-2 mt-4 mb-1">Admins</div>
        <div v-for="a in result.admins" :key="a.id" class="py-2 border-b">
          <div class="d-flex justify-space-between text-body-2">
            <span>{{ a.name }} <span class="textSecondary">{{ a.email }}</span></span>
            <v-chip v-if="a.skipped" size="x-small" label>Left unchanged</v-chip>
            <v-chip v-else-if="a.core_user_id" size="x-small" color="success" variant="tonal" label>New account</v-chip>
            <v-chip v-else size="x-small" color="error" variant="tonal" label>Not created</v-chip>
          </div>
          <div v-if="a.password" class="d-flex align-center ga-2 mt-1">
            <span class="text-caption textSecondary">Temporary password (also emailed, shown once):</span>
            <code>{{ a.password }}</code>
            <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copy(a.password!)" />
          </div>
          <div v-if="a.skipped" class="text-caption textSecondary mt-1">{{ a.skipped }}</div>
          <div v-if="a.error" class="text-caption text-error mt-1">{{ a.error }}</div>
          <div v-if="a.old_deactivated === true" class="text-caption textSecondary mt-1">Old account deactivated on {{ result.move.from.label }}.</div>
          <div v-else-if="a.old_deactivated === false" class="text-caption text-warning mt-1">
            Couldn't deactivate the old account on {{ result.move.from.label }}. Deactivate it there by hand.
          </div>
        </div>

        <v-alert v-if="needsFollowUp" type="warning" variant="tonal" density="compact" class="mt-4"
          text="Some items weren't created on the new stack. Finish them with the Provision buttons on the hospital page." />

        <div class="text-subtitle-2 mt-4 mb-1">Still to do</div>
        <ul class="text-body-2 pl-4">
          <li v-if="result.seeding_run_id">Reference data is being seeded on the new stack.</li>
          <li v-for="n in result.not_moved" :key="n">{{ n }}</li>
        </ul>
      </v-card-text>

      <!-- ── Set up the move ────────────────────────────────────────────── -->
      <v-card-text v-else class="px-5">
        <p class="text-body-2 mb-4">
          Re-creates <strong>{{ hospitalName }}</strong> on another v3 stack: its organization, facilities and admin
          accounts. Then the hospital switches over. Nothing is deleted from the current stack.
        </p>

        <v-select v-model="target" :items="choices" item-title="label" item-value="key" label="Move to"
          variant="outlined" density="comfortable" :loading="loadingPreview"
          :hint="choices.length ? '' : 'No other stack is configured. Add one on the Systems page.'" persistent-hint />

        <template v-if="preview">
          <v-alert v-for="b in preview.blockers" :key="b" type="error" variant="tonal" density="compact" class="mb-3" :text="b" />

          <v-alert type="warning" variant="tonal" class="mb-4" title="Not moved">
            <ul class="pl-4 mt-1">
              <li v-for="n in preview.not_moved" :key="n">{{ n }}</li>
            </ul>
          </v-alert>

          <div class="text-subtitle-2 mb-1">Will be created on {{ preview.to.label }}</div>
          <ul class="text-body-2 pl-4 mb-4">
            <li>The organization</li>
            <li v-for="f in preview.facilities" :key="f.id">Facility: {{ f.name }}</li>
            <li v-for="a in preview.admins" :key="a.id">
              Admin: {{ a.name }} ({{ a.email }})
              <span v-if="a.shared" class="textSecondary"> — also administers another hospital, so left unchanged</span>
              <span v-else class="textSecondary"> — new temporary password, emailed</span>
            </li>
          </ul>

          <v-checkbox v-model="seed" density="compact" hide-details
            label="Seed reference data on the new stack afterwards" />
          <v-checkbox v-model="deactivateOld" density="compact" hide-details
            :label="`Deactivate the admins' accounts on ${preview.from.label}`" />

          <v-btn variant="text" size="small" class="px-0 mt-2" :append-icon="showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="showAdvanced = !showAdvanced">Advanced</v-btn>
          <v-expand-transition>
            <div v-if="showAdvanced" class="mt-2">
              <v-text-field v-model="existingCoreOrgId" label="Use an existing organization on the new stack (ID)"
                hint="Only if this hospital already exists there; otherwise a new organization is created."
                persistent-hint variant="outlined" density="comfortable" />
            </div>
          </v-expand-transition>

          <v-textarea v-model="reason" label="Reason (recorded)" variant="outlined" density="comfortable" rows="2"
            auto-grow class="mt-4" counter="1000" />
          <v-text-field v-model="confirmName" :label="`Type “${hospitalName}” to confirm`" variant="outlined"
            density="comfortable" :color="nameMatches ? 'success' : undefined" autocomplete="off" />
        </template>

        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-2" :text="error" />

        <div v-if="history.length" class="mt-4">
          <div class="text-subtitle-2 mb-1">Previous moves</div>
          <div v-for="m in history" :key="m.id" class="text-caption textSecondary py-1">
            {{ fmt(m.created_at) }} · {{ m.from.label }} → {{ m.to.label }} ·
            <span :class="m.status === 'failed' ? 'text-error' : ''">{{ m.status }}</span>
            <template v-if="m.moved_by"> · {{ m.moved_by }}</template> · {{ m.reason }}
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-5 pb-5">
        <v-spacer />
        <template v-if="result">
          <v-btn color="primary" variant="flat" @click="open = false">Done</v-btn>
        </template>
        <template v-else>
          <v-btn variant="text" :disabled="moving" @click="open = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="moving" :disabled="!canMove" @click="move">
            Move hospital
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
