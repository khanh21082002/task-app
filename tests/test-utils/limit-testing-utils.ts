import { supabaseServiceClient } from "./supabase-client";

export const TASK_LIMITS = {
  FREE_TIER: 100,
  PREMIUM_TIER: 10_000,
};

export async function setUserSubscriptionTier(
  userId: string,
  tier: "free" | "premium"
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { error: profileError } = await supabaseServiceClient
    .from("profiles")
    .update({ subscription_plan: tier })
    .eq("user_id", userId);

  handleSupabaseError(profileError, `Failed to set subscription tier for user`);
}

export async function setTasksCreatedCount(
  userId: string,
  count: number
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const yearMonth = new Date().toISOString().slice(0, 7);
  const { error: usageError } = await supabaseServiceClient
    .from("usage_tracking")
    .upsert({
      user_id: userId,
      year_month: yearMonth,
      tasks_created: count,
    }, {
      onConflict: "user_id,year_month"
    });

  handleSupabaseError(usageError, `Failed to update usage for ${yearMonth}`);
}

function handleSupabaseError(error: any, message: string) {
  if (error) {
    console.log(`❌ ${message} for user: ${userId}`);
    throw error;
  }
}