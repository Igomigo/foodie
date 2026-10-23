export const logger = {
  info(message: string, context: string) {
    console.info(`[${context}] ${message}`);
  },
  error(message: string, context: string) {
    console.error(`[${context}] ${message}`);
  },
};
