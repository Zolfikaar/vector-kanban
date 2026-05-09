<script setup>
import { ref, computed, watch } from 'vue'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()
const selectedBoard = computed(() => boardStore.selectedBoard)

const emit = defineEmits(['update:openCreateColumnModal'])

const props = defineProps({
  openCreateColumnModal: {
    type: Boolean,
    default: false
  }
})

const closeCreateColumnModal = () => {
  emit('update:openCreateColumnModal', false)
}

const isEmptyName = ref(false)
const hasTriedSubmit = ref(false)

const columns = ref([
  {
    id: crypto.randomUUID(),
    name: '',
    tasks: []
  }
])

watch(() => props.openCreateColumnModal, (val) => {
  if (val) {
    hasTriedSubmit.value = false
    isEmptyName.value = false
    columns.value = [{
      id: crypto.randomUUID(),
      name: '',
      tasks: []
    }]
  }
})


const AddNewColumn = () => {
  hasTriedSubmit.value = false
  isEmptyName.value = false
  columns.value.push({
    id: crypto.randomUUID(),
    name: '',
    tasks: []
  })
}

const RemoveColumn = (index) => {
  columns.value.splice(index, 1)
}

const isColumnInvalid = (col) => hasTriedSubmit.value && !col.name.trim()

const AddColumn = () => {
  hasTriedSubmit.value = true

  if (columns.value.some(col => col.name.trim() === '')) {
    isEmptyName.value = true
    return
  }

  isEmptyName.value = false

  boardStore.addColumnToBoard(columns.value)

  closeCreateColumnModal()
  columns.value = []
}
</script>

<template>
  <div class="modal-global">

    <h1>{{ selectedBoard?.name }}</h1>
    <div class="fields">

      <div class="columns">

        <div class="col-row" id="newColRow">

          <label class="medium">Column Name</label>
          <span class="err-msg" v-if="isEmptyName">Can't be empty</span>
          <div class="col-input" v-for="(col, index) in columns" :key="col.id">

            <input type="text" placeholder="e.g. Todo" v-model="col.name" :class="{ error: isColumnInvalid(col) }" />

            <button type="button" @click="RemoveColumn(index)">
              <Icon name="icon-cross" :size="16" />
            </button>

          </div>


        </div>

      </div>

    </div>

    <div class="btns">
      <button class="add-column-btn" @click="AddNewColumn">+ Add New Column</button>
      <button class="btn-primary create-btn" @click="AddColumn">Add Column</button>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fields {}

.fields .board-name {
  margin-bottom: 20px;
}

.fields .columns {}

.fields .columns .col-row {}

.fields .columns .col-row .col-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 10px;
}

.fields .board-name label,
.fields .columns .col-row label {
  color: var(--muted);
  display: inline-block;
  margin-bottom: 5px;
}

.fields .board-name input,
.fields .columns .col-row .col-input input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--muted);
  border-radius: 5px;
  padding-left: 10px;
}

.fields .board-name input:focus {
  outline-color: unset;
}

.err-msg {
  color: red;
  float: right;
}

.fields .columns .col-row .col-input input {
  width: calc(100% - 40px);
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
  display: block;
}

.btns .add-column-btn {
  color: var(--primary);
  background-color: #9797971a;
}

html.dark .btns .add-column-btn {
  background-color: white;
}

.btns .add-column-btn:hover,
html.dark .btns .add-column-btn:hover {
  background-color: var(--primary-hover);
  color: white;
}

</style>