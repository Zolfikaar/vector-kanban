<script setup>
// import { useBoardStore } from '~/stores/board'
// import { storeToRefs } from 'pinia'
// const boardStore = useBoardStore()
// const { selectedBoard } = storeToRefs(boardStore)

const props = defineProps({
  column: {
    type: Object,
    required: true
  }
})

const todoClr = '49C4E5'
const doingClr = '8471F2' 
const doneClr = '67E2AE'

function getColumnColor() {
  if (!props.column || !props.column.name) return '#000000'
  const name = props.column.name.toLowerCase()
  if (name.includes('todo')) return `#${todoClr}`
  if (name.includes('doing')) return `#${doingClr}`
  if (name.includes('done')) return `#${doneClr}`
  return '#000000'
}

</script>

<template>


  <div class="column">
    <p class="column-title bold" v-if="column && column.name">
      <span class="column-color" :style="{ backgroundColor: getColumnColor() }"></span>
      <span>
        {{ column.name }} ({{ column.tasks?.length || 0 }})
      </span>
    </p>

    <div class="tasks" v-if="column?.tasks && column.tasks.length > 0">
      <Task v-for="task in column.tasks" :task="task" />
    </div>

    <div class="no-tasks" v-else>
      <p>No tasks in this column. Add a new task to get started.</p>
      <button class="btn-secondary" @click="$emit('open-task-modal')">+ Add New Task</button>
    </div>

  </div>



</template>

<style scoped>
.column {
  background-color: var(--light);
  border-radius: 8px;
  
  width: 300px;
  display: flex;
  flex-direction: column;
}
.column-title {
  text-transform: uppercase;
  margin: 20px 0;
  color: var(--muted);
  display: flex;
  align-items: center;
}

.column-color{
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 10px;
}
</style>