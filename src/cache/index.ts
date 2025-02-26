
import { CacheManager, Character, DbCacheAdapter, IDatabaseCacheAdapter } from "@elizaos/core";

export function initializeDbCache(
  character: Character,
  db: IDatabaseCacheAdapter
) {
  if(!character.id) throw new Error("There is no id in character");
  const cache = new CacheManager(new DbCacheAdapter(db, character.id));
  return cache;
}