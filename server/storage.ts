// This file is no longer used as we're using MySQL directly
// Kept for backwards compatibility
export interface IStorage {}
export class MemStorage implements IStorage {}
export const storage = new MemStorage();
