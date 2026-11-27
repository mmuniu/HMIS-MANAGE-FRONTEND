<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useExternalPlatformsApi, type PlatformClient, type IssuedClient } from '@/composables/useExternalPlatformsApi'

// The client credentials a platform swaps for short-lived access tokens
// (held in integration-service). A secret is shown once, when issued.

const props = defineProps<{ platformId: string; platformName: string; platformActive: boolean }>()

const api = useExternalPlatformsApi()
const { $showToast } = useNuxtApp()

const loading = ref(true)
const loadError = ref('')
const clients = ref<PlatformClient[]>([])

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    clients.value = await api.clients(props.platformId)
  } catch (e: any) {
    loadError.value = e?.response?.data?.message || 'Failed to load the credentials.'
  } finally {
    loading.value = false
  }
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '—')

// ── Issue ───────────────────────────────────────────────────────────────────
const issueDialog = ref(false)
const issueName = ref('')
const issuing = ref(false)
const issued = ref<IssuedClient | null>(null)
const confirmedSaved = ref(false)

function openIssue() {
  issueName.value = ''
  issued.value = null
  confirmedSaved.value = false
  issueDialog.value = true
}

async function issue() {
  issuing.value = true
  try {
    issued.value = await api.issueClient(props.platformId, issueName.value.trim() || null)
    await load()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to issue credentials.')
  } finally {
    issuing.value = false
  }
}

// The secret leaves the page with the dialog: it cannot be shown again.
function closeIssue() {
  if (issued.value && !confirmedSaved.value) {
    if (!confirm('Close without saving the secret? It cannot be shown again; you would have to issue new credentials.')) return
  }
  issued.value = null
  issueDialog.value = false
}

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    $showToast(`${what} copied.`)
  } catch {
    $showToast(`Could not copy the ${what.toLowerCase()}; select it and copy it by hand.`)
  }
}

// ── Revoke ──────────────────────────────────────────────────────────────────
const revoking = ref<string | null>(null)

async function revoke(c: PlatformClient) {
  if (!confirm(`Revoke ${c.name || c.client_id}? ${props.platformName} loses access with these credentials at once, including tokens already issued. This cannot be undone.`)) return
  revoking.value = c.client_id
  try {
    await api.revokeClient(props.platformId, c.client_id)
    $showToast('Credentials revoked.')
    await load()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to revoke the credentials.')
  } finally {
    revoking.value = null
  }
}

onMounted(load)
defineExpose({ load })
</script>

<template>
  <v-card rounded="lg" elevation="10">
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-1 ga-2">
        <h3 class="text-h6 font-weight-semibold">Credentials</h3>
        <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-key-plus" :disabled="!!loadError" @click="openIssue">
          Issue credentials
        </v-btn>
      </div>
      <p class="text-body-2 textSecondary mb-4">
        {{ platformName }} swaps a client id and secret for an access token at
        <code>POST /api/v1/external/token</code>. Each token is short-lived and covers all of its active tenants.
      </p>

      <v-alert v-if="!platformActive" type="warning" variant="tonal" density="compact" class="mb-4">
        This platform is switched off: its credentials get no tokens until it is active again.
      </v-alert>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />
      <v-alert v-else-if="loadError" type="error" variant="tonal">{{ loadError }}</v-alert>
      <v-alert v-else-if="!clients.length" type="info" variant="tonal">
        No credentials yet. Issue a set and hand the client id and secret to {{ platformName }}.
      </v-alert>

      <v-table v-else density="comfortable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Client id</th>
            <th>Secret</th>
            <th class="text-right">Live tokens</th>
            <th>Last used</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clients" :key="c.client_id" :class="{ 'row-off': !c.is_active }">
            <td>{{ c.name || '—' }}</td>
            <td><code>{{ c.client_id }}</code></td>
            <td><code>{{ c.secret_hint }}</code></td>
            <td class="text-right">{{ c.active_tokens }}</td>
            <td class="text-no-wrap">{{ when(c.last_used_at) }}</td>
            <td>
              <v-chip :color="c.is_active ? 'success' : 'error'" size="x-small" variant="tonal" label>
                {{ c.is_active ? 'Active' : `Revoked ${when(c.revoked_at)}` }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn v-if="c.is_active" size="small" variant="text" color="error" :loading="revoking === c.client_id" @click="revoke(c)">
                Revoke
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>

    <!-- Issue credentials -->
    <v-dialog :model-value="issueDialog" max-width="600" persistent scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-4 pb-2">
          {{ issued ? 'Save these credentials now' : 'Issue credentials' }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="closeIssue" />
        </v-card-title>
        <v-divider />

        <v-card-text v-if="!issued" class="pa-4">
          <p class="text-body-2 textSecondary mb-4">
            A new client id and secret for {{ platformName }}. Name them after where they will be used, so you know which to
            revoke later.
          </p>
          <v-text-field v-model="issueName" label="Name" placeholder="e.g. Production" autofocus maxlength="100"
            variant="outlined" density="comfortable" @keyup.enter="issue" />
        </v-card-text>

        <v-card-text v-else class="pa-4">
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            The secret is shown only now. Copy it to a safe place and send it to {{ platformName }} over a secure channel.
          </v-alert>

          <p class="text-caption textSecondary mb-1">Client id</p>
          <div class="d-flex align-center ga-2 mb-3">
            <code class="secret-box flex-grow-1">{{ issued.client_id }}</code>
            <v-btn icon="mdi-content-copy" size="small" variant="text" aria-label="Copy the client id" @click="copy(issued.client_id, 'Client id')" />
          </div>

          <p class="text-caption textSecondary mb-1">Client secret</p>
          <div class="d-flex align-center ga-2 mb-3">
            <code class="secret-box flex-grow-1">{{ issued.client_secret }}</code>
            <v-btn icon="mdi-content-copy" size="small" variant="text" aria-label="Copy the client secret" @click="copy(issued.client_secret, 'Client secret')" />
          </div>

          <p class="text-caption textSecondary mb-1">Token URL</p>
          <div class="d-flex align-center ga-2 mb-3">
            <code class="secret-box flex-grow-1">{{ issued.token_url }}</code>
            <v-btn icon="mdi-content-copy" size="small" variant="text" aria-label="Copy the token URL" @click="copy(issued.token_url, 'Token URL')" />
          </div>

          <p class="text-body-2 textSecondary mb-3">
            Tokens last {{ issued.token_ttl_minutes }} minutes. Each request sends the token as <code>Authorization: Bearer …</code>
            and names its tenant in <code>X-Tenant-Id</code>.
          </p>

          <v-checkbox v-model="confirmedSaved" label="I have saved the secret" color="primary" hide-details density="compact" />
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4 ga-2">
          <v-spacer />
          <template v-if="!issued">
            <v-btn variant="text" @click="closeIssue">Cancel</v-btn>
            <v-btn color="primary" variant="flat" :loading="issuing" @click="issue">Issue</v-btn>
          </template>
          <v-btn v-else color="primary" variant="flat" :disabled="!confirmedSaved" @click="closeIssue">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.row-off td {
  opacity: 0.6;
}
.secret-box {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  word-break: break-all;
  font-size: 0.85rem;
}
</style>
