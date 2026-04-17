import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, type User, type InsertUser, type UpdateProfile } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserProfile(id: string, profile: UpdateProfile): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profileFallbacks: Map<string, User>;

  constructor() {
    this.users = new Map();
    this.profileFallbacks = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async updateUserProfile(id: string, profile: UpdateProfile): Promise<User | undefined> {
    const existingUser = this.users.get(id);

    if (!existingUser) {
      const fallbackUser = this.profileFallbacks.get(id) ?? {
        id,
        username: `external_${id}`,
        password: "",
        fullname: profile.fullname,
        age: null,
        phone: null,
        avatar: null,
        address: null,
      };

      const updatedFallbackUser: User = {
        ...fallbackUser,
        ...profile,
        avatar: profile.avatar || null,
      };

      this.profileFallbacks.set(id, updatedFallbackUser);
      return updatedFallbackUser;
    }

    const updatedUser: User = { ...existingUser, ...profile };
    this.users.set(id, updatedUser);

    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      age: null,
      phone: null,
      avatar: null,
      address: null,
    };
    this.users.set(id, user);
    return user;
  }
}

export class DatabaseStorage implements IStorage {
  private profileFallbacks = new Map<string, User>();

  async getUser(id: string): Promise<User | undefined> {
    if (!db) {
      return undefined;
    }

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) {
      return undefined;
    }

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async updateUserProfile(id: string, profile: UpdateProfile): Promise<User | undefined> {
    if (!db) {
      return undefined;
    }

    const [user] = await db
      .update(users)
      .set({
        fullname: profile.fullname,
        age: profile.age,
        phone: profile.phone,
        avatar: profile.avatar || null,
        address: profile.address,
      })
      .where(eq(users.id, id))
      .returning();

    if (user) {
      return user;
    }

    const fallbackUser = this.profileFallbacks.get(id) ?? {
      id,
      username: `external_${id}`,
      password: "",
      fullname: profile.fullname,
      age: null,
      phone: null,
      avatar: null,
      address: null,
    };

    const updatedFallbackUser: User = {
      ...fallbackUser,
      ...profile,
      avatar: profile.avatar || null,
    };

    this.profileFallbacks.set(id, updatedFallbackUser);
    return updatedFallbackUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) {
      throw new Error("Database connection is not configured");
    }

    const [user] = await db
      .insert(users)
      .values({
        fullname: insertUser.fullname,
        username: insertUser.username,
        password: insertUser.password,
      })
      .returning();

    return user;
  }
}

export const storage = db ? new DatabaseStorage() : new MemStorage();
