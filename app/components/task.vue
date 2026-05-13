<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const subtasks = computed(() => {
  if (props.task && props.task.subtasks) {
    return props.task.subtasks
  }
  return []
})

const completedSubtasks = computed(() => {
  return subtasks.value.filter(subtask => subtask.isCompleted).length
})

const totalSubtasks = computed(() => {
  return subtasks.value.length
})



</script>

<template>
  <div class="task" v-if="task && task.title" >
    <h3 class="task-title" style="margin-bottom: 5px;">{{ task.title }}</h3>
    <p class="subtasks medium">{{ completedSubtasks }} of {{ totalSubtasks }} subtask{{ totalSubtasks > 1 ? 's' : '' }}
    </p>
  </div>

</template>

<style scoped>
.task {
  min-height: 88px;
  background-color: var(--card-topbar-sidebar);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.task:hover {
  cursor: pointer;
}

.task:hover .task-title {
  color: var(--primary);
}

.task .subtasks {
  font-size: 0.9rem;
  color: var(--muted);
  margin-top: 5px;
}
</style>