import { supabaseServiceClient } from "./supabase-client";

export const TASK_TIER_LIMITS = {
  FREE_TIER: 100,
  PREMIUM_TIER: 10_000,
};

export async function updateSubscriptionTier(
  userId: string,
  tier: "free" | "premium"
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { error: subscriptionError } = await supabaseServiceClient
    .from("profiles")
    .update({ subscription_plan: tier })
    .eq("user_id", userId);

  handleSupabaseErrorMessage(subscriptionError, `Failed to set subscription tier for user`);
}

export async function updateTaskCount(
  userId: string,
  count: number
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const formattedDate = new Date().toISOString().slice(0, 7);
  const { error: taskUsageError } = await supabaseServiceClient
    .from("usage_tracking")
    .upsert({
      user_id: userId,
      year_month: formattedDate,
      tasks_created: count,
    }, {
      onConflict: "user_id,year_month"
    });

  handleSupabaseErrorMessage(taskUsageError, `Failed to update usage for ${formattedDate}`);
}

function handleSupabaseErrorMessage(error: any, message: string, userId: string) {
  if (error) {
    console.log(`❌ ${message} for user: ${userId}`);
    throw error;
  }
}