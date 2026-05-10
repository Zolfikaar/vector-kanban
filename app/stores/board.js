import { defineStore } from 'pinia'

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    
    isLoading: false,
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
      status: null,
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
        const savedBoards = localStorage.getItem('boards')

        if (savedBoards) {
          this.boards = JSON.parse(savedBoards)
          return
        }

        const response = await fetch('/data.json')
        const data = await response.json()

        this.boards = data.boards

        this.saveBoards()

      } catch (error) {
        console.error(error)
      } finally {
        this.isLoading = false
      }

    },

    saveBoards() {
      localStorage.setItem('boards', JSON.stringify(this.boards))
    },

    /** Keep each task's `status` aligned with the column it lives in (e.g. after drag-and-drop). */
    syncTaskStatusesWithColumns() {
      const board = this.selectedBoard
      if (!board?.columns) return

      for (const column of board.columns) {
        if (!Array.isArray(column.tasks)) continue
        for (const task of column.tasks) {
          task.status = column.name
        }
      }
    },

    selectBoard(board) {
      this.selectedBoard = board
    },

    createNewBoard(newBoard) {

      this.boards.push(newBoard)

      this.saveBoards()

    },

    deleteBoard(board) {

      const index = this.boards.indexOf(board)

      if (index !== -1) {
        this.boards.splice(index, 1)
      }

      this.saveBoards()

      this.selectedBoard = null

    },

    editBoard(updatedBoard) {

      const index = this.boards.indexOf(this.selectedBoard)

      if (index !== -1) {
        this.boards[index] = updatedBoard
      }

      this.saveBoards()

    },

    addColumnToBoard(columns) {

      const index = this.boards.indexOf(this.selectedBoard)

      if (index !== -1) {
        this.boards[index].columns.push(...columns)
      }

      this.saveBoards()

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

      this.saveBoards()
      return true
    },

    resetCreateTaskDraft(status = null) {
      this.createTaskDraft = {
        title: '',
        description: '',
        status,
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

    createTask() {
      const title = this.createTaskDraft.title.trim()
      const status = this.createTaskDraft.status

      if (!this.selectedBoard || !title || !status) return false

      const targetColumn = this.selectedBoard.columns.find((column) => column.name === status)

      if (!targetColumn) return false
      if (!Array.isArray(targetColumn.tasks)) {
        targetColumn.tasks = []
      }

      const newTask = {
        title,
        description: this.createTaskDraft.description.trim(),
        status,
        subtasks: this.createTaskDraft.subtasks
          .map((subtaskTitle) => subtaskTitle.trim())
          .filter(Boolean)
          .map((subtaskTitle) => ({
            title: subtaskTitle,
            isCompleted: false
          }))
      }

      targetColumn.tasks.push(newTask)
      this.saveBoards()
      this.closeCreateTaskModal()

      return true
    },

    openCreateTaskModal(column = null) {
      const defaultStatus = column?.name ?? this.selectedBoard?.columns?.[0]?.name ?? null

      this.resetCreateTaskDraft(defaultStatus)
      this.selectedColumn = column
      this.isCreateTaskModalOpen = true
    },

    editTask(updatedTask) {
      if (!this.selectedBoard || !this.selectedColumn || !this.selectedTask) return false

      const sourceColumn = this.selectedColumn
      const taskIndex = sourceColumn.tasks.indexOf(this.selectedTask)
      const targetColumn =
        this.selectedBoard.columns.find((column) => column.name === updatedTask.status) ||
        sourceColumn

      if (taskIndex !== -1) {
        if (!Array.isArray(targetColumn.tasks)) {
          targetColumn.tasks = []
        }

        if (targetColumn === sourceColumn) {
          sourceColumn.tasks[taskIndex] = updatedTask
        } else {
          sourceColumn.tasks.splice(taskIndex, 1)
          targetColumn.tasks.push(updatedTask)
          this.selectedColumn = targetColumn
        }

        this.selectedTask = updatedTask
        this.saveBoards()
        this.closeAllModals()
        return true
      }
      return false
    },

    deleteTask() {
      if (!this.selectedBoard || !this.selectedColumn || !this.selectedTask) return false

      const taskIndex = this.selectedColumn.tasks.indexOf(this.selectedTask)

      if (taskIndex !== -1) {
        this.selectedColumn.tasks.splice(taskIndex, 1)
        this.saveBoards()
        // this.isDeleteTaskModalOpen = false
        this.closeAllModals()
        return true
      }

      return false
    },


  }
})