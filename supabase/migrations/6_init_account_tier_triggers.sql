<think>
Alright, I need to help the user by renaming variables and functions in their PostgreSQL code to improve readability. Let me start by understanding the code they provided.

The function is named update_task_limit_on_plan_change(). It's a trigger function that runs before an update on the profiles table. The function checks if the subscription plan has changed to 'premium' or downgraded to 'free' and adjusts the tasks_limit accordingly.

First, I'll look at the function name. It's a bit long, but it's descriptive. Maybe I can make it more concise. The word "on" can be replaced with "when" for better readability, so I'll change it to update_task_limit_when_plan_changes(). That sounds clearer.

Next, I'll examine the trigger name. It's currently update_task_limit. To make it more specific, I can rename it to update_task_limit_on_plan_change. This clearly indicates when the trigger activates.

Now, looking at the variables inside the function: NEW and OLD. These are default in PostgreSQL triggers, so I don't need to change them. However, I can make the code more readable by adding comments or perhaps using more descriptive variable names if I had any, but in this case, NEW and OLD are standard and clear.

I'll also check the structure of the function. The comments inside the function are helpful, but perhaps I can make them more concise. For example, "If subscription plan changed to premium" can be shortened to "Set higher limit for premium plan" and "If downgraded to free" can become "Set lower limit for free plan." This makes the code cleaner and easier to read at a glance.

I should ensure that the logic remains the same. The function correctly checks if the plan is changing to premium and sets the limit to 10000. If downgrading to free, it sets it to 100. The trigger is set to execute before an update on the profiles table, which is appropriate.

I'll also make sure that the trigger is correctly linked to the function. The renamed function should be referenced properly in the trigger creation.

Finally, I'll review the entire code to ensure that all changes are correctly applied and that there are no syntax errors. The function and trigger names should be clear, and the code should be more readable without altering its functionality.
</think>

-- Function to update task limit when plan changes
CREATE OR REPLACE FUNCTION update_task_limit_when_plan_changes()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set higher limit for premium plan
  IF NEW.subscription_plan = 'premium' AND 
     (OLD.subscription_plan IS NULL OR OLD.subscription_plan = 'free') THEN
    NEW.tasks_limit := 10000;
  -- Set lower limit for free plan
  ELSIF NEW.subscription_plan = 'free' AND OLD.subscription_plan = 'premium' THEN
    NEW.tasks_limit := 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update task limit on plan change
CREATE TRIGGER update_task_limit_on_plan_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_task_limit_when_plan_changes();