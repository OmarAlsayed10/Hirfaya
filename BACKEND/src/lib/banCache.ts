import prisma from "./prisma";

// ponytail: in-memory ban lists, single-instance only. Move to Redis if the
// server ever runs more than one process.
const bannedIps = new Set<string>();
const bannedUsers = new Set<string>();

export const loadBanCache = async (): Promise<void> => {
  const [ips, users] = await Promise.all([
    prisma.bannedIp.findMany({ select: { ip: true } }),
    prisma.user.findMany({ where: { banned: true }, select: { id: true } }),
  ]);
  bannedIps.clear();
  bannedUsers.clear();
  ips.forEach((r) => bannedIps.add(r.ip));
  users.forEach((u) => bannedUsers.add(u.id));
};

export const isIpBanned = (ip: string): boolean => bannedIps.has(ip);
export const isUserBanned = (id: string): boolean => bannedUsers.has(id);

export const addBannedIp = (ip: string): void => {
  bannedIps.add(ip);
};
export const removeBannedIp = (ip: string): void => {
  bannedIps.delete(ip);
};
export const addBannedUser = (id: string): void => {
  bannedUsers.add(id);
};
export const removeBannedUser = (id: string): void => {
  bannedUsers.delete(id);
};
