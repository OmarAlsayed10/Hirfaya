export const PROJECT_IMPORT_CONSTANTS = {
  // Maximum number of characters from README to send to AI (~4K tokens)
  MAX_README_CHARS: 15000,
  
  // Maximum allowed file size for .md upload in bytes (500 KB)
  MAX_FILE_SIZE_BYTES: 500 * 1024,
  
  // Rate limits per 15-minute window
  FREE_USER_RATE_LIMIT: 2,
  PRO_USER_RATE_LIMIT: 5,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
};
