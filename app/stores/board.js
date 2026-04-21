import { defineStore } from 'pinia'

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    
    selectedBoard: null,
    selectedTask: null,
    selectedColumn: null,

    isTaskModalOpen: false,
    isCreateBoardOpen: false,
    isDeleteBoardOpen: false,
    isEditBoardOpen: false,
    isCreateColumnOpen: false,
    isEditTaskOpen: false,
    isDeleteTaskOpen: false,
    isCreateTaskOpen: false,

    newTaskTitle: '',
    newTaskDescription: '',
    newTaskSubtasks: [],
    newTaskStatus: null
  }),

  getters: {
    isOverlayActive: (state) =>
      state.isTaskModalOpen ||
      state.isCreateBoardOpen ||
      state.isDeleteBoardOpen ||
      state.isEditBoardOpen ||
      state.isCreateColumnOpen ||
      state.isEditTaskOpen ||
      state.isDeleteTaskOpen ||
      state.isCreateTaskOpen
  },

  actions: {

    async loadBoards() {

      const savedBoards = localStorage.getItem('boards')

      if (savedBoards) {
        this.boards = JSON.parse(savedBoards)
        return
      }

      try {

        const response = await fetch('/data.json')
        const data = await response.json()

        this.boards = data.boards

        this.saveBoards()

      } catch (error) {
        console.error(error)
      }

    },

    saveBoards() {
      localStorage.setItem('boards', JSON.stringify(this.boards))
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

    openTaskModal(task, column) {

      this.selectedTask = task
      this.selectedColumn = column
      this.isTaskModalOpen = true

    },

    closeAllModals() {

      this.isTaskModalOpen = false
      this.isCreateBoardOpen = false
      this.isDeleteBoardOpen = false
      this.isEditBoardOpen = false
      this.isCreateColumnOpen = false
      this.isEditTaskOpen = false
      this.isDeleteTaskOpen = false
      this.isCreateTaskOpen = false

    },

    resetNewTaskData() {

      this.newTaskTitle = ''
      this.newTaskDescription = ''
      this.newTaskSubtasks = []
      this.newTaskStatus = null
      this.isCreateTaskOpen = false
    },

    createTask() {
      if (!this.newTaskTitle || !this.newTaskStatus) return

      const newTask = {
        title: this.newTaskTitle,
        description: this.newTaskDescription,
        subtasks: this.newTaskSubtasks.map((subtask) => ({
          title: subtask,
          isCompleted: false
        }))
      }

      const column = this.selectedBoard.columns.find(col => col.name === this.newTaskStatus)

      if (column) {
        column.tasks.push(newTask)
        this.saveBoards()
      }

      this.resetNewTaskData()
    },

  }
})