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
    isCreateColumnOpen: false
  }),

  getters: {
    isOverlayActive: (state) =>
      state.isTaskModalOpen ||
      state.isCreateBoardOpen ||
      state.isDeleteBoardOpen ||
      state.isEditBoardOpen ||
      state.isCreateColumnOpen
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

    }

  }
})