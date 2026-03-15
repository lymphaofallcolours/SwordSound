export const IPC_CHANNELS = {
  SAVE_SESSION: 'session:save',
  LOAD_SESSION: 'session:load',
  DELETE_SESSION: 'session:delete',
  LIST_SESSIONS: 'session:list',
  GET_SESSIONS_DIR: 'session:get-dir',
  SHOW_SAVE_DIALOG: 'dialog:save',
  SHOW_OPEN_DIALOG: 'dialog:open',
  READ_FILE: 'file:read',
  WRITE_FILE: 'file:write',
} as const;
