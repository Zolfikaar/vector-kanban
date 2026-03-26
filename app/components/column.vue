<script setup>
// import { useBoardStore } from '~/stores/board'
// import { storeToRefs } from 'pinia'
// const boardStore = useBoardStore()
// const { selectedBoard } = storeToRefs(boardStore)
import { computed } from 'vue'


const props = defineProps({
  column: {
    type: Object,
    required: true
  }
})

const colors = [
  { name: 'default', color: '#000000' },
  { name: 'todo', color: '#49C4E5' },
  { name: 'doing', color: '#8471F2' },
  { name: 'done', color: '#67E2AE' },
  { name: 'next', color: '#5AD0F0' },
  { name: 'now', color: '#3BB9DB' },
  { name: 'later', color: '#6FD6F4' },
  { name: 'urgent', color: '#2FA7C9' },
  { name: 'low', color: '#7BE0FF' },
  { name: 'high', color: '#54CBE8' },
  { name: 'backlog', color: '#957FF5' },
  { name: 'sprint', color: '#A08CFF' },
  { name: 'release', color: '#7260E8' },
  { name: 'archive', color: '#6B5BD6' },
  { name: 'bug', color: '#9C8BFF' },
  { name: 'feature', color: '#FF7FB2' },
  { name: 'improvement', color: '#F07FAE' },
  { name: 'testing', color: '#FF92C1' },
  { name: 'meeting', color: '#E96AA0' },
  { name: 'research', color: '#FFB86B' },
  { name: 'design', color: '#FFD966' },
  { name: 'deployment', color: '#FFA24C' },
  { name: 'documentation', color: '#FFE38A' },
  { name: 'planning', color: '#FFCA8A' },
  { name: 'retrospective', color: '#F5C94C' },
  { name: 'review', color: '#F5A75D' },
  { name: 'analysis', color: '#FFEAA7' },
  { name: 'research', color: '#FFEAA7' },
  { name: 'analysis', color: '#FFEAA7' }
]


const columnColor = computed(() => {
  const match = colors.find(
    c => c.name.toLowerCase() === props.column.name.toLowerCase()
  )

  return match ? match.color : '#000000'
})


</script>

<template>


  <div class="column">
    <p class="column-title bold" v-if="column && column.name">
      <span class="column-color" :style="{ backgroundColor: columnColor }"></span>
      <span>
        {{ column.name }} ({{ column.tasks?.length || 0 }})
      </span>
    </p>

    <div class="tasks" v-if="column?.tasks && column.tasks.length > 0">
      <Task v-for="task in column.tasks" :task="task" />
    </div>

    <div class="no-task" v-else>
      <p>No tasks in this column. Add a new task to get started.</p>
      <button class="btn-primary">
        + Add New Task
      </button>
    </div>

  </div>



</template>

<style scoped>
.column {
  background-color: var(--light);
  border-radius: 8px;

  width: 300px;
  /* Prevent flexbox from shrinking columns; otherwise horizontal overflow never occurs. */
  flex: 0 0 300px;
  flex-shrink: 0;
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

.column-color {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 10px;
}

.no-task {
  min-height: 88px;
  background-color: var(--card-topbar-sidebar);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>