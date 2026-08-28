import {
  AppConfigService,
  createDataClient,
  createFighterAnalyticsRepository,
  createFighterRepository,
  createFighterScoringService,
  createGameService,
  createUserSubmissionEventRepository,
  createUserSubmissionRepository,
  FeatureFlagService,
} from "../data";
import { getSupabaseClient } from "./supabase";

export function getDataClient(env: Env) {
  return createDataClient(getSupabaseClient(env));
}

export function getGameService(env: Env) {
  return createGameService(getSupabaseClient(env));
}

export function getFighterScoringService(env: Env) {
  return createFighterScoringService(getSupabaseClient(env));
}

export function getFeatureFlagService(env: Env) {
  return new FeatureFlagService(getSupabaseClient(env));
}

export function getAppConfigService(env: Env) {
  return new AppConfigService(getSupabaseClient(env));
}

export function getFighterAnalyticsRepository(env: Env) {
  return createFighterAnalyticsRepository(getSupabaseClient(env));
}

export function getFighterRepository(env: Env) {
  return createFighterRepository(getSupabaseClient(env));
}

export function getUserSubmissionEventRepository(env: Env) {
  return createUserSubmissionEventRepository(getSupabaseClient(env));
}

export function getUserSubmissionRepository(env: Env) {
  return createUserSubmissionRepository(getSupabaseClient(env));
}
