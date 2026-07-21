import { AsyncLocalStorage } from "async_hooks";

const als = new AsyncLocalStorage<{ userId?: string }>();

export const runWithUser = <T>(userId: string | undefined, fn: () => T): T =>
  als.run({ userId }, fn);

export const getUserId = (): string | undefined => als.getStore()?.userId;
