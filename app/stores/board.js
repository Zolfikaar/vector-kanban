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
        
        const data = await $fetch('/api/boards')
        console.log(data[0]);

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

    // saveBoards() {
    //   localStorage.setItem('boards', JSON.stringify(this.boards))
    // },

   
   async syncTaskStatusesWithColumns() {


      const board = this.selectedBoard
      if (!board?.columns) return

      // مصفوفة لنجمع فيها كل طلبات التحديث ونرسلها مرة واحدة (اختياري للأداء)
      const updatePromises = []

      this.selectedBoard.columns.forEach((column) => {
        if (Array.isArray(column.tasks)) {
          column.tasks.forEach((task, index) => {
            // تحديث الحالة محلياً (كما كان سابقاً)
            task.status = column.name 
            
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

    createNewBoard(newBoard) {

      this.boards.push(newBoard)

      // this.saveBoards()

    },

    deleteBoard(board) {

      const index = this.boards.indexOf(board)

      if (index !== -1) {
        this.boards.splice(index, 1)
      }

      // this.saveBoards()

      this.selectedBoard = null

    },

    editBoard(updatedBoard) {

      const index = this.boards.indexOf(this.selectedBoard)

      if (index !== -1) {
        this.boards[index] = updatedBoard
      }

      // this.saveBoards()

    },

    addColumnToBoard(columns) {

      const index = this.boards.indexOf(this.selectedBoard)

      if (index !== -1) {
        this.boards[index].columns.push(...columns)
      }

      // this.saveBoards()

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

    // createTask() {
    //   const title = this.createTaskDraft.title.trim()
    //   const status = this.createTaskDraft.status

    //   if (!this.selectedBoard || !title || !status) return false

    //   const targetColumn = this.selectedBoard.columns.find((column) => column.name === status)

    //   if (!targetColumn) return false
    //   if (!Array.isArray(targetColumn.tasks)) {
    //     targetColumn.tasks = []
    //   }

    //   const newTask = {
    //     title,
    //     description: this.createTaskDraft.description.trim(),
    //     status,
    //     subtasks: this.createTaskDraft.subtasks
    //       .map((subtaskTitle) => subtaskTitle.trim())
    //       .filter(Boolean)
    //       .map((subtaskTitle) => ({
    //         title: subtaskTitle,
    //         isCompleted: false
    //       }))
    //   }

    //   targetColumn.tasks.push(newTask)
    //   // this.saveBoards()
    //   this.closeCreateTaskModal()

    //   return true
    // },

    async createTask() {
      try {
        const newTask = await $fetch('/api/tasks', {
          method: 'POST',
          body: this.createTaskDraft
        })
        
        // أضفها محلياً بعد نجاح السيرفر
        this.selectedColumn.tasks.push(newTask)
        this.closeAllModals()
      } catch (error) {
        console.error("Error saving task:", error)
      }
    },

    openCreateTaskModal(column = null) {
      const defaultStatus = column?.name ?? this.selectedBoard?.columns?.[0]?.name ?? null

      this.resetCreateTaskDraft(defaultStatus)
      this.selectedColumn = column
      this.isCreateTaskModalOpen = true
    },

    // editTask(updatedTask) {
    //   if (!this.selectedBoard || !this.selectedColumn || !this.selectedTask) return false

    //   const sourceColumn = this.selectedColumn
    //   const taskIndex = sourceColumn.tasks.indexOf(this.selectedTask)
    //   const targetColumn =
    //     this.selectedBoard.columns.find((column) => column.name === updatedTask.status) ||
    //     sourceColumn

    //   if (taskIndex !== -1) {
    //     if (!Array.isArray(targetColumn.tasks)) {
    //       targetColumn.tasks = []
    //     }

    //     if (targetColumn === sourceColumn) {
    //       sourceColumn.tasks[taskIndex] = updatedTask
    //     } else {
    //       sourceColumn.tasks.splice(taskIndex, 1)
    //       targetColumn.tasks.push(updatedTask)
    //       this.selectedColumn = targetColumn
    //     }

    //     this.selectedTask = updatedTask
    //     // this.saveBoards()
    //     this.closeAllModals()
    //     return true
    //   }
    //   return false
    // },

    // deleteTask() {
    //   if (!this.selectedBoard || !this.selectedColumn || !this.selectedTask) return false

    //   const taskIndex = this.selectedColumn.tasks.indexOf(this.selectedTask)

    //   if (taskIndex !== -1) {
    //     this.selectedColumn.tasks.splice(taskIndex, 1)
    //     // this.saveBoards()
    //     // this.isDeleteTaskModalOpen = false
    //     this.closeAllModals()
    //     return true
    //   }

    //   return false
    // },

    async editTask(updatedTask) {
      if (!this.selectedBoard || !this.selectedColumn || !this.selectedTask) return false
      
      try {
        await $fetch(`/api/tasks/${this.selectedTask.id}`, {
          method: 'PATCH',
          body: updatedTask
        })
      } catch (error) {
        console.error("Error editing task:", error)
      }
    },

    async deleteTask() {
      if (!this.selectedTask) return
      
      try {
        await $fetch(`/api/tasks/${this.selectedTask.id}`, {
          method: 'DELETE'
        })
        
        // احذفها محلياً بعد نجاح السيرفر
        const index = this.selectedColumn.tasks.indexOf(this.selectedTask)
        this.selectedColumn.tasks.splice(index, 1)
        this.closeAllModals()
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    }
  }
})