import type { AppConfigResponseDto } from "@challenger-fantasy/schemas";
import type { Database, DBClient } from "@challenger-fantasy/types";

type AppConfigRow = Database["public"]["Tables"]["app_config"]["Row"];
// Auto-managed columns excluded. `satisfies` below enforces that every data
// column has a default — add a column, run typegen, and it breaks here until
// you add the corresponding default.
type AppConfigData = Omit<AppConfigRow, "id" | "updated_at">;

const DEFAULT_CONFIG = {
  maintenance_mode: false,
  min_app_version: "1.0.0",
  ios_min_app_version: "1.0.0",
  ios_latest_app_version: "1.0.0",
  review_prompt_min_sessions: 5,
  review_prompt_cooldown_days: 3,
  track_page_live_preview_count: 6,
  track_page_upcoming_preview_count: 6,
  track_page_results_preview_count: 3,
  draft_initializing_time_seconds: 30,
  max_concurrent_drafts: 3,
} satisfies AppConfigData;

// TODO: this mapper should go in ~/mappers and should map to a domain model instead of directly to the response dto.
function rowToDto(row: AppConfigData): AppConfigResponseDto {
  return {
    maintenanceMode: row.maintenance_mode,
    minAppVersion: row.ios_min_app_version,
    ios: {
      minAppVersion: row.ios_min_app_version,
      latestAppVersion: row.ios_latest_app_version,
    },
    reviewPromptMinSessions: row.review_prompt_min_sessions,
    reviewPromptCooldownDays: row.review_prompt_cooldown_days,
    trackPageLivePreviewCount: row.track_page_live_preview_count,
    trackPageUpcomingPreviewCount: row.track_page_upcoming_preview_count,
    trackPageResultsPreviewCount: row.track_page_results_preview_count,
    draftInitializingTimeSeconds: row.draft_initializing_time_seconds,
    maxConcurrentDrafts: row.max_concurrent_drafts,
  };
}

export const DEFAULT_APP_CONFIG = rowToDto(DEFAULT_CONFIG);

export class AppConfigService {
  constructor(private supabase: DBClient) {}

  async get(): Promise<AppConfigResponseDto> {
    const { data } = await this.supabase.schema("public").from("app_config").select("*").single();

    if (!data) return DEFAULT_APP_CONFIG;
    return rowToDto(data);
  }
}
