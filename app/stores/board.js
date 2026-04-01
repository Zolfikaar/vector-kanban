import { defineStore } from 'pinia'

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    selectedBoard: null
  }),

  actions: {

    async loadBoards() {

      const savedBoards = localStorage.getItem('boards')

      if (savedBoards) {

        this.boards = JSON.parse(savedBoards)

      } else {

        const url = '/data.json'

        try {

          const response = await fetch(url)
          const data = await response.json()

          this.boards = data.boards
          
          this.saveBoards()

        } catch (error) {
          console.error(error)
        }
      }
    },

    saveBoards() {
      localStorage.setItem('boards', JSON.stringify(this.boards))
    },
    
     selectBoard(board) {
      this.selectedBoard =  board
    },

    createNewBoard(newBoard) {

      this.boards.push(newBoard)

      this.saveBoards()
      
    }
  }
})