import type {
  DBClient,
  Fighter,
  FighterColumns,
  FighterExplorerQueryOptions,
} from "@challenger-fantasy/types";

export class FighterExplorerService {
  constructor(private supabase: DBClient) {}

  public async getFighters(options?: FighterExplorerQueryOptions): Promise<Fighter[]> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 9;

    const orderColumn: FighterColumns = options?.sortBy ?? "full_name";

    const { data, error } = await this.supabase
      .schema("public")
      .from("fighter")
      .select("*")
      .order(orderColumn, { ascending: options?.sortOrder === "asc" })
      .range(offset, offset + limit);
    if (error) throw error;
    return data;
  }
}
