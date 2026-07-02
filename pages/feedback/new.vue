<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsApi } from '@/composables/useReportsApi'
import { MODULES, SEVERITIES, type ReportType, type Severity } from '@/types/report'
import { useNuxtApp } from '#app'

const router = useRouter()
const api = useReportsApi()
const { $showToast } = useNuxtApp()

const MAX_FILES = 5
const MAX_SIZE = 50 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

const form = reactive({
  type: 'bug' as ReportType,
  title: '',
  description: '',
  severity: 'medium' as Severity,
  module: '',
})

interface Attachment { file: File; url: string; kind: 'image' | 'video' }
const attachments = ref<Attachment[]>([])
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const submitting = ref(false)
const progress = ref(0)
const done = ref(false)
const createdTicket = ref('')
const errors = ref<Record<string, string>>({})

// Auto-detected environment info.
const env = reactive({ browser: '', os: '', url: '' })
onMounted(() => {
  const ua = navigator.userAgent
  env.browser = /Edg/.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Unknown'
  env.os = /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /Linux/.test(ua) ? 'Linux' : 'Unknown'
  env.url = window.location.href
})

onBeforeUnmount(() => attachments.value.forEach((a) => URL.revokeObjectURL(a.url)))

const isBug = computed(() => form.type === 'bug')

function pickFiles() { fileInput.value?.click() }

function addFiles(files: FileList | File[]) {
  for (const file of Array.from(files)) {
    if (attachments.value.length >= MAX_FILES) { $showToast(`Up to ${MAX_FILES} files allowed.`); break }
    const isImage = IMAGE_TYPES.includes(file.type)
    const isVideo = VIDEO_TYPES.includes(file.type)
    if (!isImage && !isVideo) { $showToast(`${file.name}: unsupported file type.`); continue }
    if (file.size > MAX_SIZE) { $showToast(`${file.name}: exceeds 50 MB.`); continue }
    attachments.value.push({ file, url: URL.createObjectURL(file), kind: isVideo ? 'video' : 'image' })
  }
}
function onFileInput(e: Event) {
  const t = e.target as HTMLInputElement
  if (t.files) addFiles(t.files)
  t.value = ''
}
function onDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}
function removeAttachment(i: number) {
  URL.revokeObjectURL(attachments.value[i].url)
  attachments.value.splice(i, 1)
}
function fmtSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function validate(): boolean {
  errors.value = {}
  if (!form.title.trim()) errors.value.title = 'Title is required.'
  else if (form.title.length > 120) errors.value.title = 'Max 120 characters.'
  if (!form.description.trim()) errors.value.description = 'Description is required.'
  else if (form.description.trim().length < 20) errors.value.description = 'Please add at least 20 characters.'
  if (!form.module) errors.value.module = 'Choose the affected module.'
  if (isBug.value && !form.severity) errors.value.severity = 'Select a severity.'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (submitting.value) return
  if (!validate()) { $showToast('Please fix the highlighted fields.'); return }
  submitting.value = true
  progress.value = 0
  try {
    const detail = await api.create({
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      severity: isBug.value ? form.severity : null,
      module: form.module,
      browser: env.browser,
      os: env.os,
      page_url: env.url,
      files: attachments.value.map((a) => a.file),
    }, (pct) => (progress.value = pct))
    createdTicket.value = detail.ticket_id
    done.value = true
  } catch (err: any) {
    const v = err?.response?.data?.errors
    if (v) errors.value = Object.fromEntries(Object.entries(v).map(([k, m]: any) => [k.split('.')[0], m[0]]))
    $showToast(err?.response?.data?.message || 'Submission failed.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto" style="max-width: 820px">
    <!-- Success state -->
    <v-card v-if="done" rounded="xl" elevation="10" class="text-center pa-8">
      <v-avatar color="success" variant="tonal" size="72" class="mb-4">
        <v-icon icon="mdi-check-bold" size="40" />
      </v-avatar>
      <h2 class="text-h5 font-weight-semibold mb-2">Thank you! Your report was submitted.</h2>
      <p class="textSecondary mb-1">We've logged it and notified our team.</p>
      <v-chip color="primary" variant="tonal" label class="mb-6">Ticket {{ createdTicket.slice(0, 8) }}</v-chip>
      <div class="d-flex justify-center ga-3">
        <v-btn color="primary" :to="`/feedback/${createdTicket}`">View report</v-btn>
        <v-btn variant="tonal" to="/feedback">All my reports</v-btn>
        <v-btn variant="text" @click="() => { done = false; form.title=''; form.description=''; attachments=[] }">
          Submit another
        </v-btn>
      </div>
    </v-card>

    <!-- Form -->
    <template v-else>
      <div class="mb-6">
        <h2 class="text-h4 font-weight-semibold">Send Feedback</h2>
        <p class="textSecondary">Report a bug or suggest a feature. The more detail, the faster we can help.</p>
      </div>

      <v-card rounded="xl" elevation="10">
        <v-card-text class="pa-6">
          <!-- Report type (segmented) -->
          <v-btn-toggle v-model="form.type" mandatory divided rounded="lg" color="primary" class="mb-6 w-100">
            <v-btn value="bug" class="flex-grow-1"><v-icon start icon="mdi-bug" /> Report a Bug</v-btn>
            <v-btn value="feature" class="flex-grow-1"><v-icon start icon="mdi-lightbulb-on" /> Suggest a Feature</v-btn>
          </v-btn-toggle>

          <!-- Title -->
          <v-text-field
            v-model="form.title" label="Title" placeholder="Briefly describe the issue or idea"
            variant="outlined" counter="120" maxlength="120" :error-messages="errors.title"
            class="mb-2" density="comfortable"
          />

          <!-- Description -->
          <v-textarea
            v-model="form.description" variant="outlined" rows="6" auto-grow class="mb-2"
            :error-messages="errors.description"
            :label="isBug ? 'What happened?' : 'Describe your idea'"
            :placeholder="isBug
              ? 'What happened? What did you expect? How can we reproduce it?'
              : 'What should it do, and why would it be useful?'"
          />

          <div class="d-flex flex-wrap ga-4 mb-2">
            <!-- Severity (bugs only) -->
            <v-select
              v-if="isBug" v-model="form.severity" :items="SEVERITIES" label="Severity"
              variant="outlined" density="comfortable" :error-messages="errors.severity"
              style="min-width: 200px" class="flex-grow-1"
            >
              <template #selection="{ item }"><span class="text-capitalize">{{ item.title }}</span></template>
              <template #item="{ item, props }"><v-list-item v-bind="props" class="text-capitalize" /></template>
            </v-select>

            <!-- Module -->
            <v-select
              v-model="form.module" :items="MODULES" label="Module / Page"
              variant="outlined" density="comfortable" :error-messages="errors.module"
              style="min-width: 200px" class="flex-grow-1"
            />
          </div>

          <!-- Attachments -->
          <p class="text-subtitle-2 font-weight-medium mt-4 mb-2">Attachments <span class="textSecondary font-weight-regular">(optional — up to 5, 50 MB each)</span></p>
          <div
            class="dropzone rounded-lg pa-6 text-center mb-3" :class="{ 'dropzone--over': dragOver }"
            @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="onDrop"
            @click="pickFiles"
          >
            <input ref="fileInput" type="file" hidden multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" @change="onFileInput" />
            <v-icon icon="mdi-cloud-upload-outline" size="40" color="primary" class="mb-2" />
            <p class="mb-1">Drag &amp; drop images or videos here</p>
            <p class="text-caption textSecondary mb-3">JPG, PNG, WEBP · MP4, MOV, WEBM</p>
            <v-btn variant="tonal" color="primary" size="small" prepend-icon="mdi-folder-open">Browse files</v-btn>
          </div>

          <!-- Previews -->
          <div v-if="attachments.length" class="d-flex flex-wrap ga-3 mb-2">
            <div v-for="(a, i) in attachments" :key="i" class="preview rounded-lg">
              <img v-if="a.kind === 'image'" :src="a.url" class="preview-media" alt="" />
              <div v-else class="preview-media d-flex align-center justify-center bg-grey-darken-3">
                <video :src="a.url" class="preview-media" muted />
                <v-icon icon="mdi-play-circle" size="36" color="white" class="preview-play" />
              </div>
              <v-btn icon="mdi-close" size="x-small" color="error" variant="flat" class="preview-remove" @click.stop="removeAttachment(i)" />
              <div class="preview-name text-caption">{{ a.file.name }}<br>{{ fmtSize(a.file.size) }}</div>
            </div>
          </div>

          <!-- Auto-detected env -->
          <v-expansion-panels class="mt-4" variant="accordion">
            <v-expansion-panel elevation="0">
              <v-expansion-panel-title class="text-caption textSecondary">
                <v-icon icon="mdi-information-outline" size="16" class="mr-2" /> Automatically included details
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="text-caption textSecondary">
                  <div>Browser: {{ env.browser }}</div>
                  <div>Operating system: {{ env.os }}</div>
                  <div class="text-truncate">Page URL: {{ env.url }}</div>
                  <div>Date &amp; time: captured automatically on submit</div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Upload progress -->
          <div v-if="submitting" class="mt-4">
            <v-progress-linear :model-value="progress" height="8" rounded color="primary" />
            <p class="text-caption textSecondary mt-1">Uploading… {{ progress }}%</p>
          </div>

          <div class="d-flex justify-end ga-3 mt-6">
            <v-btn variant="text" to="/feedback" :disabled="submitting">Cancel</v-btn>
            <v-btn color="primary" size="large" :loading="submitting" :disabled="submitting"
              prepend-icon="mdi-send" @click="submit">
              Submit Report
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<style scoped>
.ga-3 { gap: 12px; }
.ga-4 { gap: 16px; }
.dropzone {
  border: 2px dashed rgba(var(--v-theme-primary), 0.35);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.dropzone:hover, .dropzone--over {
  background: rgba(var(--v-theme-primary), 0.06);
  border-color: rgb(var(--v-theme-primary));
}
.preview { position: relative; width: 120px; }
.preview-media { width: 120px; height: 90px; object-fit: cover; border-radius: 8px; display: block; }
.preview-play { position: absolute; top: 28px; left: 42px; pointer-events: none; }
.preview-remove { position: absolute; top: 4px; right: 4px; }
.preview-name { line-height: 1.1; margin-top: 4px; word-break: break-word; }
</style>
