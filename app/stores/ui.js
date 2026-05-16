import { defineStore } from 'pinia'

export const MODAL_NAMES = {
  VIEW_TASK: 'viewTask',
  CREATE_BOARD: 'createBoard',
  DELETE_BOARD: 'deleteBoard',
  EDIT_BOARD: 'editBoard',
  CREATE_COLUMN: 'createColumn',
  EDIT_TASK: 'editTask',
  DELETE_TASK: 'deleteTask',
  CREATE_TASK: 'createTask',
  DELETE_COLUMN: 'deleteColumn',
}

const THEME_STORAGE_KEY = 'theme'

export const useUiStore = defineStore('ui', {
  state: () => ({
    isSidebarHidden: false,
    activeModalName: null,
    isSubmitting: false,
    theme: 'light',
    isActiveMobileOverlay: false,

    selectedTask: null,
    selectedColumn: null,
    createTaskDraft: {
      title: '',
      description: '',
      columnId: null,
      subtasks: [''],
    },
  }),

  getters: {
    isDarkTheme: (state) => state.theme === 'dark',

    isOverlayActive: (state) => state.activeModalName !== null,

    isViewTaskModalOpen: (state) =>
      state.activeModalName === MODAL_NAMES.VIEW_TASK,
    isCreateBoardModalOpen: (state) =>
      state.activeModalName === MODAL_NAMES.CREATE_BOARD,
    isDeleteBoardModalOpen: (state) =>
      state.activeModalName === MODAL_NAMES.DELETE_BOARD,
    isEditBoardModalOpen: (state) =>
      state.activeModalName === MODAL_NAMES.EDIT_BOARD,
    isCreateColumnModalOpen: (state) =>
      state.activeModalName === MODAL_NAMES.CREATE_COLUMN,
    isEditTaskModalOpen: (state) =>
      state.activeModalName === MODAL_NAMES.EDIT_TASK,
    isDeleteTaskModalOpen: (state) =>
      state.activeModalName === MODAL_NAMES.DELETE_TASK,
    isCreateTaskModalOpen: (state) =>
      state.activeModalName === MODAL_NAMES.CREATE_TASK,
    isDeleteColumnModalOpen: (state) =>
      state.activeModalName === MODAL_NAMES.DELETE_COLUMN,
  },

  actions: {
    initTheme() {
      if (typeof window === 'undefined') return

      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      this.theme = storedTheme === 'dark' ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', this.theme === 'dark')
    },

    setTheme(theme) {
      this.theme = theme === 'dark' ? 'dark' : 'light'

      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', this.theme === 'dark')
        localStorage.setItem(THEME_STORAGE_KEY, this.theme)
      }
    },

    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark')
    },

    showSidebar() {
      this.isSidebarHidden = false
    },

    hideSidebar() {
      this.isSidebarHidden = true
    },

    openModal(name) {
      this.activeModalName = name
    },

    switchModal(name) {
      this.activeModalName = name
    },

    closeAllModals() {
      this.activeModalName = null
      this.isActiveMobileOverlay = false
    },

    resetCreateTaskDraft(columnId = null) {
      this.createTaskDraft = {
        title: '',
        description: '',
        columnId,
        subtasks: [''],
      }
    },

    closeCreateTaskModal() {
      this.resetCreateTaskDraft()
      if (this.activeModalName === MODAL_NAMES.CREATE_TASK) {
        this.activeModalName = null
      }
    },

    openCreateColumnModal() {
      this.openModal(MODAL_NAMES.CREATE_COLUMN)
    },

    openCreateBoardModal() {
      this.openModal(MODAL_NAMES.CREATE_BOARD)
    },

    openTaskModal(task, column) {
      this.selectedTask = task
      this.selectedColumn = column
      this.openModal(MODAL_NAMES.VIEW_TASK)
    },

    prepareCreateTaskModal(column = null, selectedBoard = null) {
      const defaultColumnId =
        column?.id ?? selectedBoard?.columns?.[0]?.id ?? null

      this.resetCreateTaskDraft(defaultColumnId)
      this.selectedColumn =
        column ??
        selectedBoard?.columns?.find(
          (c) => Number(c.id) === Number(defaultColumnId)
        ) ??
        null
      this.openModal(MODAL_NAMES.CREATE_TASK)
    },
  },
})
