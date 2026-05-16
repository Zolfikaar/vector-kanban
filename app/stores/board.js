import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import { useUiStore } from './ui'

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    selectedBoard: null,
    isLoading: false,
  }),

  actions: {
    async loadBoards() {
      this.isLoading = true

      try {
        const data = await $fetch('/api/boards')

        this.boards = data || []

        if (this.boards.length > 0 && !this.selectedBoard) {
          this.selectedBoard = this.boards[0]
        }
      } catch (error) {
        console.error('Error loading boards:', error)
      } finally {
        this.isLoading = false
      }
    },

    async syncTaskStatusesWithColumns() {
      const board = this.selectedBoard
      if (!board?.columns) return

      const updatePromises = []

      this.selectedBoard.columns.forEach((column) => {
        if (Array.isArray(column.tasks)) {
          column.tasks.forEach((task, index) => {
            task.columnId = column.id

            const promise = $fetch(`/api/tasks/${task.id}`, {
              method: 'PATCH',
              body: {
                columnId: column.id,
                order: index,
              },
            }).catch((err) =>
              console.error(`Failed to update task ${task.id}:`, err)
            )

            updatePromises.push(promise)
          })
        }
      })
    },

    selectBoard(board) {
      this.selectedBoard = board
    },

    getErrorMessage(error, fallback) {
      return (
        error?.data?.statusMessage ||
        error?.data?.message ||
        error?.message ||
        fallback
      )
    },

    async createBoard({ title, columns }) {
      const ui = useUiStore()
      ui.isSubmitting = true

      try {
        const newBoard = await $fetch('/api/boards', {
          method: 'POST',
          body: {
            title: title.trim(),
            columns: columns.map((column) => ({
              title: column.title.trim(),
            })),
          },
        })

        ui.closeAllModals()
        this.boards.push(newBoard)
        this.selectBoard(newBoard)
        toast.success('Board created successfully')
        return true
      } catch (error) {
        console.error('Error creating board:', error)
        ui.closeAllModals()
        toast.error(
          this.getErrorMessage(error, 'Could not create board. Please try again.')
        )
        return false
      } finally {
        ui.isSubmitting = false
      }
    },

    async deleteBoard(board) {
      if (!board?.id) return false

      const ui = useUiStore()
      ui.isSubmitting = true

      try {
        await $fetch(`/api/boards/${board.id}`, {
          method: 'DELETE',
        })

        const index = this.boards.findIndex((b) => b.id === board.id)
        if (index !== -1) {
          this.boards.splice(index, 1)
        }

        const wasSelected = this.selectedBoard?.id === board.id
        if (wasSelected) {
          this.selectedBoard = this.boards[0] ?? null
        }

        ui.closeAllModals()
        toast.success('Board deleted successfully')
        return true
      } catch (error) {
        console.error('Error deleting board:', error)
        ui.closeAllModals()
        toast.error(
          this.getErrorMessage(error, 'Could not delete board. Please try again.')
        )
        return false
      } finally {
        ui.isSubmitting = false
      }
    },

    async editBoard(
      { title, columns },
      { successMessage = 'Board updated successfully' } = {}
    ) {
      if (!this.selectedBoard?.id) return false

      const ui = useUiStore()
      ui.isSubmitting = true

      try {
        const updatedBoard = await $fetch(
          `/api/boards/${this.selectedBoard.id}`,
          {
            method: 'PATCH',
            body: {
              title: title.trim(),
              columns: columns.map((column) => ({
                id: column.id ?? undefined,
                title: column.title.trim(),
              })),
            },
          }
        )

        const index = this.boards.findIndex(
          (b) => b.id === this.selectedBoard.id
        )
        if (index !== -1) {
          this.boards[index] = updatedBoard
        }

        this.selectedBoard = updatedBoard
        ui.closeAllModals()
        toast.success(successMessage)
        return true
      } catch (error) {
        console.error('Error updating board:', error)
        ui.closeAllModals()
        toast.error(
          this.getErrorMessage(error, 'Could not update board. Please try again.')
        )
        return false
      } finally {
        ui.isSubmitting = false
      }
    },

    async addColumnToBoard(newColumns) {
      if (!this.selectedBoard) return false

      const sanitized = newColumns
        .map((column) => ({
          title: (column.title ?? column.name ?? '').trim(),
        }))
        .filter((column) => column.title)

      if (!sanitized.length) return false

      const existingColumns = (this.selectedBoard.columns || []).map(
        (column) => ({
          id: column.id,
          title: column.title,
        })
      )

      return this.editBoard(
        {
          title: this.selectedBoard.title,
          columns: [...existingColumns, ...sanitized],
        },
        { successMessage: 'Column(s) added successfully' }
      )
    },

    toggleSelectedTaskSubtask(subtaskIndex) {
      const ui = useUiStore()
      if (!ui.selectedTask?.subtasks?.[subtaskIndex]) return false

      ui.selectedTask.subtasks[subtaskIndex].isCompleted =
        !ui.selectedTask.subtasks[subtaskIndex].isCompleted

      return true
    },

    openCreateTaskModal(column = null) {
      useUiStore().prepareCreateTaskModal(column, this.selectedBoard)
    },

    async createTask() {
      const ui = useUiStore()
      const draft = ui.createTaskDraft

      if (
        !draft.title?.trim() ||
        draft.columnId == null ||
        draft.subtasks.some((subtask) => !subtask.trim())
      ) {
        return false
      }

      const targetColumn = this.selectedBoard.columns.find(
        (c) => Number(c.id) === Number(draft.columnId)
      )

      ui.isSubmitting = true
      try {
        const newTask = await $fetch('/api/tasks', {
          method: 'POST',
          body: {
            title: draft.title.trim(),
            description: draft.description?.trim() ?? '',
            columnId: Number(draft.columnId),
            order: targetColumn?.tasks?.length ?? 0,
            subtasks: draft.subtasks.map((s) => s.trim()),
          },
        })

        if (targetColumn && newTask) {
          if (!Array.isArray(targetColumn.tasks)) targetColumn.tasks = []
          targetColumn.tasks.unshift(newTask)
        }

        ui.closeAllModals()
        toast.success('Task created successfully')
        return true
      } catch (error) {
        console.error('Error saving task:', error)
        const message =
          error?.data?.statusMessage ||
          error?.data?.message ||
          error?.message ||
          'Could not create task. Please try again.'
        toast.error(message)
        return false
      } finally {
        ui.isSubmitting = false
      }
    },

    async editTask(updatedTask) {
      const ui = useUiStore()

      if (!this.selectedBoard || !ui.selectedColumn || !ui.selectedTask) {
        return false
      }

      if (
        !updatedTask.title?.trim() ||
        updatedTask.subtasks?.some((subtask) => !subtask.title?.trim())
      ) {
        return false
      }

      ui.isSubmitting = true

      try {
        const sourceColumn = ui.selectedColumn
        const taskIndex = sourceColumn.tasks.indexOf(ui.selectedTask)

        const targetColumnId = Number(updatedTask.columnId)
        const targetColumn =
          this.selectedBoard.columns.find(
            (column) => Number(column.id) === targetColumnId
          ) || sourceColumn

        await $fetch(`/api/tasks/${ui.selectedTask.id}`, {
          method: 'PATCH',
          body: {
            title: updatedTask.title,
            description: updatedTask.description,
            columnId: targetColumn.id,
          },
        })

        if (taskIndex === -1) return false

        if (!Array.isArray(targetColumn.tasks)) {
          targetColumn.tasks = []
        }

        if (Number(targetColumn.id) === Number(sourceColumn.id)) {
          sourceColumn.tasks[taskIndex] = {
            ...ui.selectedTask,
            ...updatedTask,
          }
        } else {
          sourceColumn.tasks.splice(taskIndex, 1)
          targetColumn.tasks.push({ ...ui.selectedTask, ...updatedTask })
          ui.selectedColumn = targetColumn
        }

        ui.selectedTask = { ...ui.selectedTask, ...updatedTask }

        ui.closeAllModals()
        toast.success('Task updated successfully')
        return true
      } catch (error) {
        console.error('Failed to edit task:', error)
        const message =
          error?.data?.statusMessage ||
          error?.data?.message ||
          error?.message ||
          'Could not update task. Please try again.'
        toast.error(message)
        return false
      } finally {
        ui.isSubmitting = false
      }
    },

    async deleteTask() {
      const ui = useUiStore()
      if (!ui.selectedTask) return false

      ui.isSubmitting = true

      try {
        await $fetch(`/api/tasks/${ui.selectedTask.id}`, {
          method: 'DELETE',
        })

        const index = ui.selectedColumn.tasks.indexOf(ui.selectedTask)
        if (index !== -1) {
          ui.selectedColumn.tasks.splice(index, 1)
        }

        ui.closeAllModals()
        toast.success('Task deleted successfully')
        return true
      } catch (error) {
        console.error('Failed to delete task:', error)
        const message =
          error?.data?.statusMessage ||
          error?.data?.message ||
          error?.message ||
          'Could not delete task. Please try again.'
        toast.error(message)
        return false
      } finally {
        ui.isSubmitting = false
      }
    },
  },
})
