<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import { DOCUMENT_STATUS_COLOR } from '@/types/deployment'
import type { DeploymentDocumentEntry, DocumentStatus } from '@/types/deployment'

interface Props {
  show: boolean
  deploymentId: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:show'])

const store = useDeploymentsStore()

const localShow = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const documents = computed(() => store.current?.documents || [])

const newDoc = reactive({ title: '', category: '' })
const adding = ref(false)

async function addDocument() {
  if (!newDoc.title.trim()) return
  adding.value = true
  const res = await store.addDocument(props.deploymentId, { title: newDoc.title, category: newDoc.category || undefined })
  if (res.success) {
    newDoc.title = ''
    newDoc.category = ''
  }
  adding.value = false
}

const REVIEW_STATUS_OPTIONS: { title: string; value: DocumentStatus }[] = [
  { title: 'Under review', value: 'UNDER_REVIEW' },
  { title: 'Verified', value: 'VERIFIED' },
  { title: 'Approved', value: 'APPROVED' },
  { title: 'Rejected', value: 'REJECTED' },
  { title: 'Not applicable', value: 'NOT_APPLICABLE' },
]

const busyDocId = ref<number | null>(null)
const fileInputs = reactive<Record<number, HTMLInputElement | null>>({})

function setFileInputRef(docId: number, el: Element | ComponentPublicInstance | null) {
  fileInputs[docId] = el as HTMLInputElement | null
}

function triggerUpload(docId: number) {
  fileInputs[docId]?.click()
}

async function onFileChosen(doc: DeploymentDocumentEntry, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  busyDocId.value = doc.id
  await store.uploadDocument(props.deploymentId, doc.id, file)
  busyDocId.value = null
}

async function reviewDocument(doc: DeploymentDocumentEntry, status: DocumentStatus) {
  busyDocId.value = doc.id
  await store.reviewDocument(props.deploymentId, doc.id, { status })
  busyDocId.value = null
}

async function removeDocument(doc: DeploymentDocumentEntry) {
  busyDocId.value = doc.id
  await store.deleteDocument(props.deploymentId, doc.id)
  busyDocId.value = null
}
</script>

<template>
  <v-dialog v-model="localShow" max-width="720px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Documents
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <div class="d-flex flex-wrap ga-2 align-center mb-4">
          <v-text-field v-model="newDoc.title" label="Document title" density="compact" variant="outlined" hide-details style="max-width: 240px" />
          <v-text-field v-model="newDoc.category" label="Category (optional)" density="compact" variant="outlined" hide-details style="max-width: 200px" />
          <v-btn color="primary" variant="tonal" :loading="adding" :disabled="!newDoc.title.trim()" @click="addDocument">
            Add document
          </v-btn>
        </div>

        <v-divider class="mb-4" />

        <div v-for="doc in documents" :key="doc.id" class="d-flex flex-wrap align-center ga-3 mb-3">
          <div style="min-width: 200px; flex: 1 1 200px">
            <div class="font-weight-medium">{{ doc.title }}</div>
            <div class="text-caption textSecondary">
              <span v-if="doc.category">{{ doc.category }} — </span>
              <span v-if="doc.original_name">{{ doc.original_name }}</span>
              <span v-else>No file uploaded</span>
            </div>
          </div>
          <v-chip size="small" variant="tonal" label :color="DOCUMENT_STATUS_COLOR[doc.status]">
            {{ doc.status.replace('_', ' ') }}
          </v-chip>
          <a v-if="doc.url" :href="doc.url" target="_blank" rel="noopener" class="text-caption">View file</a>

          <input
            :ref="(el) => setFileInputRef(doc.id, el)"
            type="file" class="d-none"
            @change="onFileChosen(doc, $event)"
          />
          <v-btn size="small" variant="text" :loading="busyDocId === doc.id" @click="triggerUpload(doc.id)">
            {{ doc.original_name ? 'Re-upload' : 'Upload' }}
          </v-btn>

          <v-select
            :model-value="null"
            :items="REVIEW_STATUS_OPTIONS"
            label="Set review status"
            density="compact" variant="outlined" hide-details style="max-width: 180px"
            :disabled="!doc.original_name"
            @update:model-value="(v) => v && reviewDocument(doc, v)"
          />

          <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" :loading="busyDocId === doc.id" @click="removeDocument(doc)" />
        </div>
        <p v-if="!documents.length" class="text-body-2 textSecondary">No documents added yet.</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
