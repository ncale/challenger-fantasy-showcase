import { featureFlagRulesSchema } from "../../schemas";
import type { Database, DBClient } from "../../types";
import { z } from "zod";
import { hash } from "../lib/utils.ts";

type Flag = Database["public"]["Tables"]["feature_flag"]["Row"];

export class FeatureFlagService {
  constructor(private supabase: DBClient) {}

  private evaluateFlag(flag: Flag, userId: string) {
    if (!flag.enabled) return false;

    const rules = featureFlagRulesSchema.parse(flag.rules);

    if (rules.allow_users && !rules.allow_users.includes(userId)) {
      return false;
    }

    if (rules.percentage) {
      const result = parseInt(hash(userId), 16);
      return result % 100 < rules.percentage;
    }

    return true;
  }

  async getForUser(userId: string) {
    z.uuid().parse(userId);

    const { data, error } = await this.supabase.schema("public").from("feature_flag").select("*");
    if (error) throw error;

    return Object.fromEntries(
      data.map((ff) => {
        return [ff.key, this.evaluateFlag(ff, userId)];
      }),
    );
  }

  // Returns the global enabled state without per-user rule evaluation.
  // Use this for unauthenticated callers or public endpoints.
  async getPublic() {
    const { data, error } = await this.supabase
      .schema("public")
      .from("feature_flag")
      .select("key, enabled");
    if (error) throw error;

    return Object.fromEntries(data.map((ff) => [ff.key, ff.enabled]));
  }
}
