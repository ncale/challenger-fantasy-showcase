alter table public.daily_mma_game_submission_live_score
rename column total_score to overall_score;

alter table public.daily_mma_game_submission_ranking
rename column score to overall_score;

alter table public.daily_mma_game_submission_ranking
add column breakdown jsonb;
