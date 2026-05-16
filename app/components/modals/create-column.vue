<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'

const boardStore = useBoardStore()
const uiStore = useUiStore()
const { isSubmitting } = storeToRefs(uiStore)
const selectedBoard = computed(() => boardStore.selectedBoard)

const emit = defineEmits(['update:openCreateColumnModal'])

const props = defineProps({
  openCreateColumnModal: {
    type: Boolean,
    default: false
  }
})

const hasTriedSubmit = ref(false)

const columns = ref([
  {
    id: crypto.randomUUID(),
    title: '',
    tasks: []
  }
])

watch(() => props.openCreateColumnModal, (val) => {
  if (val) {
    hasTriedSubmit.value = false
    columns.value = [{
      id: crypto.randomUUID(),
      title: '',
      tasks: []
    }]
  }
})

const trimColumnTitle = (col) => {
  col.title = col.title.trim()
}

const addNewColumn = () => {
  hasTriedSubmit.value = false
  columns.value.push({
    id: crypto.randomUUID(),
    title: '',
    tasks: []
  })
}

const removeColumn = (index) => {
  columns.value.splice(index, 1)
}

const isAnyColumnEmpty = computed(() =>
  columns.value.some((col) => !col.title.trim())
)
const isColumnInvalid = (col) => hasTriedSubmit.value && !col.title.trim()

const submitAddColumns = async () => {
  if (isSubmitting.value) return

  hasTriedSubmit.value = true
  columns.value.forEach(trimColumnTitle)

  if (isAnyColumnEmpty.value) return

  const success = await boardStore.addColumnToBoard(columns.value)
  if (success) {
    columns.value = [{
      id: crypto.randomUUID(),
      title: '',
      tasks: []
    }]
    emit('update:openCreateColumnModal', false)
  }
}
</script>

<template>
  <div class="modal-global">
    <h1>{{ selectedBoard?.title }}</h1>
    <div class="fields">
      <div class="columns">
        <div class="col-row" id="newColRow">
          <label class="medium">Column Name</label>

          <div
            v-for="(col, index) in columns"
            :key="col.id"
            class="col-input"
          >
            <span v-if="isColumnInvalid(col)" class="field-error">Can't be empty</span>
            <div class="col-input-row">
              <input
                v-model="col.title"
                type="text"
                placeholder="e.g. Todo"
                :class="{ error: isColumnInvalid(col) }"
                @blur="trimColumnTitle(col)"
              >
              <button type="button" @click="removeColumn(index)">
                <Icon name="icon-cross" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="btns">
      <button type="button" class="add-column-btn" @click="addNewColumn">
        + Add New Column
      </button>
      <button
        type="button"
        class="btn-primary create-btn"
        :disabled="isSubmitting"
        @click="submitAddColumns"
      >
        <AppSpinner v-if="isSubmitting" :size="18" label="Adding column" />
        <span>{{ isSubmitting ? 'Adding…' : 'Add Column' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.fields .columns .col-row .col-input {
  margin-bottom: 10px;
}

.fields .columns .col-row label {
  color: var(--muted);
  display: inline-block;
  margin-bottom: 5px;
}

.fields .columns .col-row .col-input input {
  width: calc(100% - 40px);
  height: 40px;
  border: 1px solid var(--input-border);
  border-radius: 5px;
  padding-left: 10px;
  background: var(--card-topbar-sidebar);
  color: var(--text);
}

.field-error {
  color: var(--danger);
  font-weight: 700;
  font-size: 12px;
  text-align: right;
}

.col-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.col-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.col-input-row input {
  flex: 1;
  min-width: 0;
}

.fields .columns .col-row .col-input button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-width: 2rem;
  min-height: 2rem;
}

.fields .columns .col-row .col-input button:hover {
  color: var(--danger);
}

.fields .columns .col-row .col-input input.error {
  border-color: var(--danger);
}

.btns button {
  width: 100%;
  height: 40px;
  border-radius: 50px;
  border: none;
}

.btns button:hover {
  cursor: pointer;
}

.btns .create-btn {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btns .create-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.btns .add-column-btn {
  color: var(--primary);
  background-color: var(--secondary-btn);
}

.btns .add-column-btn:hover {
  background-color: var(--primary-hover);
  color: white;
}
</style>
