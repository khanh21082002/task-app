import { supabase, supabaseServiceClient } from "../test-utils/supabase-client";
import {
  TestUser,
  getOrCreateTestUser,
  cleanupTestUser,
  createTask,
} from "../test-utils/user-testing-utils";

const TEST_USERS = {
  bob: {
    name: "Bob (Test User)",
    email: "test-user.bob@pixegami.io",
    password: "Test123!@#Bob",
  },
  charlie: {
    name: "Charlie (Test User)",
    email: "test-user.charlie@pixegami.io",
    password: "Test123!@#Charlie",
  },
};

describe("Suite 2: Test Auth Use Cases", () => {
  let testUsers: Record<string, TestUser>;

  beforeAll(async () => {
    testUsers = {
      bob: await getOrCreateTestUser(TEST_USERS.bob),
      charlie: await getOrCreateTestUser(TEST_USERS.charlie),
    };
  }, 15_000);

  afterAll(async () => {
    await Promise.all(
      Object.values(testUsers).map(async (user) => {
        if (user.id) await cleanupTestUser(user.id);
      })
    );
  }, 15_000);

  test("user cannot edit tasks of other users", async () => {
    // Create task as Bob
    const { data: createData, error: createError } = await createTask(
      testUsers.bob,
      "Test Task"
    );
    expect(createError).toBeFalsy();
    expect(createData).toBeTruthy();

    const task = createData[0];
    const taskId = task.task_id;

    // Sign in as Charlie
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.charlie.email,
      password: TEST_USERS.charlie.password,
    });

    // Try to read Bob's task
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("task_id", taskId);

    expect(error).toBeFalsy();
    expect(data).toHaveLength(0);
  }, 15_000);

  test("can get jwt auth token for logged in user", async () => {
    const { data, error } = await supabaseServiceClient.auth.signInWithPassword({
      email: TEST_USERS.bob.email,
      password: TEST_USERS.bob.password,
    });

    expect(data).toBeTruthy();
    expect(error).toBeFalsy();
    expect(data.session?.access_token).toBeDefined();
  }, 15_000);
});