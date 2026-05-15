import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    
    isLoading: false,
    isSubmitting: false,
    selectedBoard: null,
    selectedTask: null,
    selectedColumn: null,

    isViewTaskModalOpen: false,
    isCreateBoardModalOpen: false,
    isDeleteBoardModalOpen: false,
    isEditBoardModalOpen: false,
    isCreateColumnModalOpen: false,
    isEditTaskModalOpen: false,
    isDeleteTaskModalOpen: false,
    isCreateTaskModalOpen: false,
    isActiveMobileOverlay: false,

    createTaskDraft: {
      title: '',
      description: '',
      columnId: null,
      subtasks: ['']
    }
  }),

  getters: {
    isOverlayActive: (state) =>
      state.isViewTaskModalOpen ||
      state.isCreateBoardModalOpen ||
      state.isDeleteBoardModalOpen ||
      state.isEditBoardModalOpen ||
      state.isCreateColumnModalOpen ||
      state.isEditTaskModalOpen ||
      state.isDeleteTaskModalOpen ||
      state.isCreateTaskModalOpen
  },

  actions: {

    async loadBoards() {
      this.isLoading = true

      try {
        
        const data = await $fetch('/api/boards')

        this.boards = data || []
        
        // Set the first board as selected by default if available
        if (this.boards.length > 0 && !this.selectedBoard) {
          this.selectedBoard = this.boards[0]
        }
      } catch (error) {
        console.error("Error loading boards:", error)
      } finally {
        this.isLoading = false
      }

    },

   
   async syncTaskStatusesWithColumns() {


      const board = this.selectedBoard
      if (!board?.columns) return

      // مصفوفة لنجمع فيها كل طلبات التحديث ونرسلها مرة واحدة (اختياري للأداء)
      const updatePromises = []

      this.selectedBoard.columns.forEach((column) => {
        if (Array.isArray(column.tasks)) {
          column.tasks.forEach((task, index) => {
            // Keep local task.columnId in sync with the column it sits under
            task.columnId = column.id
            
            // إرسال طلب التحديث لقاعدة البيانات
            // نفترض أن الـ API يستقبل الـ columnId والـ order الجديد
            const promise = $fetch(`/api/tasks/${task.id}`, {
              method: 'PATCH',
              body: {
                columnId: column.id,
                order: index // الترتيب الجديد للمهمة داخل العمود
              }
            }).catch(err => console.error(`Failed to update task ${task.id}:`, err))
            
            updatePromises.push(promise)
          })
        }
      })

      // حفظ التغييرات في الـ localStorage كنسخة احتياطية
      // this.saveBoards()

      // انتظار اكتمال التحديثات (اختياري)
      // await Promise.all(updatePromises)
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
      this.isSubmitting = true

      try {
        const newBoard = await $fetch('/api/boards', {
          method: 'POST',
          body: {
            title: title.trim(),
            columns: columns.map((column) => ({
              title: column.title.trim()
            }))
          }
        })

        this.closeAllModals()
        this.boards.push(newBoard)
        this.selectBoard(newBoard)
        toast.success('Board created successfully')
        return true
      } catch (error) {
        console.error('Error creating board:', error)
        this.closeAllModals()
        toast.error(
          this.getErrorMessage(error, 'Could not create board. Please try again.')
        )
        return false
      } finally {
        this.isSubmitting = false
      }
    },

    async deleteBoard(board) {
      if (!board?.id) return false

      this.isSubmitting = true

      try {
        await $fetch(`/api/boards/${board.id}`, {
          method: 'DELETE'
        })

        const index = this.boards.findIndex((b) => b.id === board.id)
        if (index !== -1) {
          this.boards.splice(index, 1)
        }

        const wasSelected = this.selectedBoard?.id === board.id
        if (wasSelected) {
          this.selectedBoard = this.boards[0] ?? null
        }

        this.closeAllModals()
        toast.success('Board deleted successfully')
        return true
      } catch (error) {
        console.error('Error deleting board:', error)
        this.closeAllModals()
        toast.error(
          this.getErrorMessage(error, 'Could not delete board. Please try again.')
        )
        return false
      } finally {
        this.isSubmitting = false
      }
    },

    async editBoard(
      { title, columns },
      { successMessage = 'Board updated successfully' } = {}
    ) {
      if (!this.selectedBoard?.id) return false

      this.isSubmitting = true

      try {
        const updatedBoard = await $fetch(
          `/api/boards/${this.selectedBoard.id}`,
          {
            method: 'PATCH',
            body: {
              title: title.trim(),
              columns: columns.map((column) => ({
                id: column.id ?? undefined,
                title: column.title.trim()
              }))
            }
          }
        )

        const index = this.boards.findIndex(
          (b) => b.id === this.selectedBoard.id
        )
        if (index !== -1) {
          this.boards[index] = updatedBoard
        }

        this.selectedBoard = updatedBoard
        this.closeAllModals()
        toast.success(successMessage)
        return true
      } catch (error) {
        console.error('Error updating board:', error)
        this.closeAllModals()
        toast.error(
          this.getErrorMessage(error, 'Could not update board. Please try again.')
        )
        return false
      } finally {
        this.isSubmitting = false
      }
    },

    async addColumnToBoard(newColumns) {
      if (!this.selectedBoard) return false

      const sanitized = newColumns
        .map((column) => ({
          title: (column.title ?? column.name ?? '').trim()
        }))
        .filter((column) => column.title)

      if (!sanitized.length) return false

      const existingColumns = (this.selectedBoard.columns || []).map(
        (column) => ({
          id: column.id,
          title: column.title
        })
      )

      return this.editBoard(
        {
          title: this.selectedBoard.title,
          columns: [...existingColumns, ...sanitized]
        },
        { successMessage: 'Column(s) added successfully' }
      )
    },

    openCreateColumnModal() {
      this.isCreateColumnModalOpen = true
    },

    openTaskModal(task, column) {

      this.selectedTask = task
      this.selectedColumn = column
      this.isViewTaskModalOpen = true

    },

    toggleSelectedTaskSubtask(subtaskIndex) {
      if (!this.selectedTask?.subtasks?.[subtaskIndex]) return false

      this.selectedTask.subtasks[subtaskIndex].isCompleted =
        !this.selectedTask.subtasks[subtaskIndex].isCompleted

      // this.saveBoards()
      return true
    },

    resetCreateTaskDraft(columnId = null) {
      this.createTaskDraft = {
        title: '',
        description: '',
        columnId,
        subtasks: ['']
      }
    },

    closeAllModals() {

      this.isViewTaskModalOpen = false
      this.isCreateBoardModalOpen = false
      this.isDeleteBoardModalOpen = false
      this.isEditBoardModalOpen = false
      this.isCreateColumnModalOpen = false
      this.isEditTaskModalOpen = false
      this.isDeleteTaskModalOpen = false
      this.isCreateTaskModalOpen = false
      this.isActiveMobileOverlay = false

    },

    closeCreateTaskModal() {
      this.resetCreateTaskDraft()
      this.isCreateTaskModalOpen = false
    },
    
    async createTask() {
      const draft = this.createTaskDraft
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

      this.isSubmitting = true
      try {
        const newTask = await $fetch('/api/tasks', {
          method: 'POST',
          body: {
            title: draft.title.trim(),
            description: draft.description?.trim() ?? '',
            columnId: Number(draft.columnId),
            order: targetColumn?.tasks?.length ?? 0,
            subtasks: draft.subtasks.map((s) => s.trim())
          }
        })

        if (targetColumn && newTask) {
          if (!Array.isArray(targetColumn.tasks)) targetColumn.tasks = []
          targetColumn.tasks.unshift(newTask)
        }

        this.closeAllModals()
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
        this.isSubmitting = false
      }
    },

    openCreateTaskModal(column = null) {
      const defaultColumnId =
        column?.id ?? this.selectedBoard?.columns?.[0]?.id ?? null

      this.resetCreateTaskDraft(defaultColumnId)
      this.selectedColumn =
        column ??
        this.selectedBoard?.columns?.find(
          (c) => Number(c.id) === Number(defaultColumnId)
        ) ??
        null
      this.isCreateTaskModalOpen = true
    },

    async editTask(updatedTask) {
      if (!this.selectedBoard || !this.selectedColumn || !this.selectedTask) {
        return false
      }

      if (
        !updatedTask.title?.trim() ||
        updatedTask.subtasks?.some((subtask) => !subtask.title?.trim())
      ) {
        return false
      }

      this.isSubmitting = true

      try {
        const sourceColumn = this.selectedColumn
        const taskIndex = sourceColumn.tasks.indexOf(this.selectedTask)

        const targetColumnId = Number(updatedTask.columnId)
        const targetColumn =
          this.selectedBoard.columns.find(
            (column) => Number(column.id) === targetColumnId
          ) || sourceColumn

        await $fetch(`/api/tasks/${this.selectedTask.id}`, {
          method: 'PATCH',
          body: {
            title: updatedTask.title,
            description: updatedTask.description,
            columnId: targetColumn.id
          }
        })

        if (taskIndex === -1) return false

        if (!Array.isArray(targetColumn.tasks)) {
          targetColumn.tasks = []
        }

        if (Number(targetColumn.id) === Number(sourceColumn.id)) {
          sourceColumn.tasks[taskIndex] = { ...this.selectedTask, ...updatedTask }
        } else {
          sourceColumn.tasks.splice(taskIndex, 1)
          targetColumn.tasks.push({ ...this.selectedTask, ...updatedTask })
          this.selectedColumn = targetColumn
        }

        this.selectedTask = { ...this.selectedTask, ...updatedTask }

        this.closeAllModals()
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
        this.isSubmitting = false
      }
    },

    async deleteTask() {
      if (!this.selectedTask) return false

      this.isSubmitting = true

      try {
        await $fetch(`/api/tasks/${this.selectedTask.id}`, {
          method: 'DELETE'
        })

        const index = this.selectedColumn.tasks.indexOf(this.selectedTask)
        if (index !== -1) {
          this.selectedColumn.tasks.splice(index, 1)
        }

        this.closeAllModals()
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
        this.isSubmitting = false
      }
    },
  }
})