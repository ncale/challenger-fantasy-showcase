import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "draft-group-ids";

async function load(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export const draftGroupStorage = {
  addGroupId: async (id: string): Promise<void> => {
    const ids = await load();
    if (!ids.includes(id)) {
      await AsyncStorage.setItem(KEY, JSON.stringify([...ids, id]));
    }
  },
  removeGroupId: async (id: string): Promise<void> => {
    const ids = await load();
    await AsyncStorage.setItem(KEY, JSON.stringify(ids.filter((i) => i !== id)));
  },
  getAll: async (): Promise<string[]> => {
    return load();
  },
};
