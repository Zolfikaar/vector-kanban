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

    buildTasksReorderPayload(columnIds = null) {
      const board = this.selectedBoard
      if (!board?.columns) return []

      const idSet =
        columnIds != null ? new Set(columnIds.map((id) => Number(id))) : null

      const payload = []

      for (const column of board.columns) {
        if (idSet && !idSet.has(Number(column.id))) continue
        if (!Array.isArray(column.tasks)) continue

        column.tasks.forEach((task, index) => {
          task.columnId = column.id
          task.order = index
          payload.push({
            id: task.id,
            order: index,
            columnId: column.id,
          })
        })
      }

      return payload
    },

    async reorderTasksAfterDrag(columnIds = null) {
      const tasks = this.buildTasksReorderPayload(columnIds)
      if (!tasks.length) return

      try {
        await $fetch('/api/tasks/reorder', {
          method: 'POST',
          body: { tasks },
        })
      } catch (error) {
        console.error('Failed to reorder tasks:', error)
        toast.error(
          this.getErrorMessage(
            error,
            'Could not save task order. Please refresh and try again.'
          )
        )
      }
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

    applyUpdatedBoard(updatedBoard) {
      if (!updatedBoard) return

      const index = this.boards.findIndex((b) => b.id === updatedBoard.id)
      if (index !== -1) {
        this.boards[index] = updatedBoard
      }
      if (this.selectedBoard?.id === updatedBoard.id) {
        this.selectedBoard = updatedBoard
      }
    },

    findBoard(boardId) {
      if (this.selectedBoard?.id === boardId) {
        return this.selectedBoard
      }
      return this.boards.find((b) => b.id === boardId) ?? null
    },

    removeOptimisticColumn(boardId, clientId) {
      const board = this.findBoard(boardId)
      if (!board?.columns) return

      const index = board.columns.findIndex((col) => col.id === clientId)
      if (index !== -1) {
        board.columns.splice(index, 1)
      }
    },

    pushOptimisticColumn(boardId, columnTitle) {
      const title = columnTitle?.trim()
      if (!title || boardId == null) return null

      const board = this.findBoard(boardId)
      if (!board) return null

      const clientId = crypto.randomUUID()
      const optimisticColumn = { id: clientId, title, tasks: [] }

      if (!Array.isArray(board.columns)) {
        board.columns = []
      }
      board.columns.push(optimisticColumn)

      return clientId
    },

    updateColumnLocally(boardId, columnId, updatedData) {
      const board = this.findBoard(boardId)
      if (!board?.columns) return false

      const column = board.columns.find(
        (col) => String(col.id) === String(columnId)
      )
      if (!column) return false

      if (updatedData.title != null) {
        column.title = updatedData.title.trim()
      }

      return true
    },

    deleteColumnLocally(boardId, columnId) {
      const board = this.findBoard(boardId)
      if (!board?.columns) return false

      const index = board.columns.findIndex(
        (col) => String(col.id) === String(columnId)
      )
      if (index === -1) return false

      board.columns.splice(index, 1)
      return true
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
      { title },
      { successMessage = 'Board updated successfully' } = {}
    ) {
      if (!this.selectedBoard?.id) return false

      const trimmedTitle = title?.trim()
      if (!trimmedTitle) return false

      const ui = useUiStore()
      ui.isSubmitting = true

      try {
        const updatedBoard = await $fetch(
          `/api/boards/${this.selectedBoard.id}`,
          {
            method: 'PATCH',
            body: { title: trimmedTitle },
          }
        )

        this.applyUpdatedBoard(updatedBoard)
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

    async addColumn(boardId, columnTitle, { closeModal = true } = {}) {
      const title = columnTitle?.trim()
      if (!title || boardId == null) return false

      const clientId = this.pushOptimisticColumn(boardId, title)
      if (!clientId) return false

      const board = this.findBoard(boardId)
      const order = (board?.columns?.length ?? 1) - 1

      try {
        const updatedBoard = await $fetch('/api/columns', {
          method: 'POST',
          body: {
            title,
            boardId,
            order,
          },
        })

        if (updatedBoard?.columns) {
          this.applyUpdatedBoard(updatedBoard)
        } else {
          this.removeOptimisticColumn(boardId, clientId)
        }

        if (closeModal) {
          useUiStore().closeAllModals()
        }
        return true
      } catch (error) {
        this.removeOptimisticColumn(boardId, clientId)
        console.error('Error adding column:', error)
        toast.error(
          this.getErrorMessage(error, 'Could not add column. Please try again.')
        )
        return false
      }
    },

    async updateColumn(boardId, columnId, updatedData) {
      const title = updatedData?.title?.trim()
      if (!title || boardId == null || columnId == null) return false

      const numericColumnId = Number(columnId)
      if (Number.isNaN(numericColumnId)) return false

      const ui = useUiStore()
      const previousTitle = this.findBoard(boardId)?.columns?.find(
        (col) => Number(col.id) === numericColumnId
      )?.title

      this.updateColumnLocally(boardId, columnId, { title })
      ui.isSubmitting = true

      try {
        const updatedBoard = await $fetch(`/api/columns/${numericColumnId}`, {
          method: 'PATCH',
          body: { title },
        })

        if (updatedBoard?.columns) {
          this.applyUpdatedBoard(updatedBoard)
        }

        ui.closeAllModals()
        toast.success('Column updated successfully')
        return true
      } catch (error) {
        if (previousTitle != null) {
          this.updateColumnLocally(boardId, columnId, { title: previousTitle })
        }
        console.error('Error updating column:', error)
        toast.error(
          this.getErrorMessage(error, 'Could not update column. Please try again.')
        )
        return false
      } finally {
        ui.isSubmitting = false
      }
    },

    async deleteColumn(boardId, columnId) {
      const ui = useUiStore()
      if (boardId == null || columnId == null) return false

      const numericColumnId = Number(columnId)
      if (Number.isNaN(numericColumnId)) return false

      ui.isSubmitting = true

      try {
        const updatedBoard = await $fetch(`/api/columns/${numericColumnId}`, {
          method: 'DELETE',
        })

        if (updatedBoard?.columns) {
          this.applyUpdatedBoard(updatedBoard)
        } else {
          this.deleteColumnLocally(boardId, columnId)
        }

        ui.closeAllModals()
        toast.success('Column deleted successfully')
        return true
      } catch (error) {
        console.error('Error deleting column:', error)
        toast.error(
          this.getErrorMessage(error, 'Could not delete column. Please try again.')
        )
        return false
      } finally {
        ui.isSubmitting = false
      }
    },

    async addColumnToBoard(newColumns) {
      if (!this.selectedBoard?.id) return false

      const sanitized = newColumns
        .map((column) => ({
          title: (column.title ?? column.name ?? '').trim(),
        }))
        .filter((column) => column.title)

      if (!sanitized.length) return false

      const ui = useUiStore()
      ui.isSubmitting = true

      try {
        let lastSuccess = false

        for (const column of sanitized) {
          const success = await this.addColumn(this.selectedBoard.id, column.title, {
            closeModal: false,
          })
          if (!success) {
            return false
          }
          lastSuccess = true
        }

        if (lastSuccess) {
          ui.closeAllModals()
          toast.success('Column(s) added successfully')
        }

        return lastSuccess
      } finally {
        ui.isSubmitting = false
      }
    },

    async toggleSelectedTaskSubtask(subtaskIndex) {
      const ui = useUiStore()
      const subtask = ui.selectedTask?.subtasks?.[subtaskIndex]
      if (!subtask?.id) return false

      const previous = subtask.isCompleted
      subtask.isCompleted = !previous

      try {
        const updated = await $fetch(`/api/subtasks/${subtask.id}`, {
          method: 'PATCH',
          body: { isCompleted: subtask.isCompleted },
        })
        subtask.isCompleted = updated.isCompleted
        return true
      } catch (error) {
        subtask.isCompleted = previous
        console.error('Failed to update subtask:', error)
        toast.error(
          this.getErrorMessage(error, 'Could not update subtask. Please try again.')
        )
        return false
      }
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
        const taskId = ui.selectedTask.id
        const previousSubtasks = ui.selectedTask.subtasks ?? []
        const keptSubtaskIds = new Set(
          updatedTask.subtasks?.filter((s) => s.id).map((s) => s.id) ?? []
        )
        const removedSubtaskIds = previousSubtasks
          .filter((s) => s.id && !keptSubtaskIds.has(s.id))
          .map((s) => s.id)

        let lastBoard = null
        for (const subtaskId of removedSubtaskIds) {
          lastBoard = await $fetch(`/api/subtasks/${subtaskId}`, {
            method: 'DELETE',
          })
        }
        if (lastBoard) {
          this.applyUpdatedBoard(lastBoard)
        }

        const previousById = new Map(
          previousSubtasks.filter((s) => s.id).map((s) => [s.id, s])
        )
        const sanitizedSubtasks = updatedTask.subtasks.filter((subtask) =>
          subtask.title?.trim()
        )

        for (const subtask of sanitizedSubtasks) {
          if (!subtask.id) {
            await $fetch('/api/subtasks', {
              method: 'POST',
              body: {
                taskId,
                title: subtask.title.trim(),
              },
            })
            continue
          }

          const previous = previousById.get(subtask.id)
          if (!previous) continue

          const patchBody = {}
          const trimmedTitle = subtask.title.trim()
          if (previous.title?.trim() !== trimmedTitle) {
            patchBody.title = trimmedTitle
          }
          if (previous.isCompleted !== subtask.isCompleted) {
            patchBody.isCompleted = subtask.isCompleted ?? false
          }

          if (Object.keys(patchBody).length > 0) {
            await $fetch(`/api/subtasks/${subtask.id}`, {
              method: 'PATCH',
              body: patchBody,
            })
          }
        }

        const sourceColumn =
          this.selectedBoard?.columns?.find((col) =>
            col.tasks?.some((task) => task.id === taskId)
          ) ?? ui.selectedColumn
        const taskIndex = sourceColumn?.tasks?.findIndex((t) => t.id === taskId) ?? -1

        const targetColumnId = Number(updatedTask.columnId)
        const targetColumn =
          this.selectedBoard.columns.find(
            (column) => Number(column.id) === targetColumnId
          ) || sourceColumn

        const serverTask = await $fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          body: {
            title: updatedTask.title,
            description: updatedTask.description,
            columnId: targetColumn.id,
          },
        })

        if (taskIndex === -1 || !sourceColumn) return false

        if (!Array.isArray(targetColumn.tasks)) {
          targetColumn.tasks = []
        }

        const mergedTask = { ...serverTask, ...updatedTask, subtasks: serverTask.subtasks }

        if (Number(targetColumn.id) === Number(sourceColumn.id)) {
          sourceColumn.tasks[taskIndex] = mergedTask
        } else {
          sourceColumn.tasks.splice(taskIndex, 1)
          targetColumn.tasks.push(mergedTask)
          ui.selectedColumn = targetColumn
        }

        ui.selectedTask = mergedTask

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
        const updatedBoard = await $fetch(`/api/tasks/${ui.selectedTask.id}`, {
          method: 'DELETE',
        })

        if (updatedBoard) {
          this.applyUpdatedBoard(updatedBoard)
        } else if (ui.selectedColumn?.tasks) {
          const taskIndex = ui.selectedColumn.tasks.indexOf(ui.selectedTask)
          if (taskIndex !== -1) {
            ui.selectedColumn.tasks.splice(taskIndex, 1)
          }
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
