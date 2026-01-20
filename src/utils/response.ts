export const success = (data: any, message?: string) => ({
  data,
  message,
});

export const error = (message: string, code?: string) => ({
  error: { message, code },
});
