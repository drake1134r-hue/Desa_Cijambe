import { deleteOne, findMany, findOne, insertOne, updateOne } from "./index";
import { news, users, categories } from "./schema";
import type { NewsItem, User } from "./schema";

export type NewsInsert = Partial<NewsItem>;
export type NewsUpdate = Partial<NewsItem>;
export type UserInsert = Partial<User>;

export async function listNews(limit = 20, offset = 0): Promise<NewsItem[]> {
  return findMany<NewsItem>(news.collectionName, {}, { sort: { created_at: -1 }, skip: offset, limit });
}

export async function getNewsById(id: number): Promise<NewsItem | undefined> {
  const item = await findOne<NewsItem>(news.collectionName, { id });
  return item ?? undefined;
}

export async function createNews(data: NewsInsert) {
  return insertOne(news.collectionName, data as Record<string, unknown>);
}

export async function updateNews(id: number, data: NewsUpdate) {
  return updateOne(news.collectionName, { id }, data as Record<string, unknown>);
}

export async function deleteNews(id: number) {
  return deleteOne(news.collectionName, { id });
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const user = await findOne<User>(users.collectionName, { username });
  return user ?? undefined;
}

export async function createUser(data: UserInsert) {
  return insertOne(users.collectionName, data as Record<string, unknown>);
}

export async function listCategories() {
  return findMany(categories.collectionName, {}, { sort: { name: 1 } });
}
