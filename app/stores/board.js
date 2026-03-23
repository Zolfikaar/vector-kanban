import { defineStore } from 'pinia'

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    selectedBoard: null
  }),

  actions: {
    async loadBoards() {

      const url = '/data.json'

      try {

        const response = await fetch(url)
        const data = await response.json()

        this.boards = data.boards       
        
      } catch (error) {
        console.error(error)
      }
      
    },
    
     selectBoard(board) {
      this.selectedBoard =  board
    }
  }
})