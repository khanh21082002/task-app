import { supabase, supabaseServiceClient } from "../test-utils/supabase-client";
import {
  TestUser,
  getOrCreateTestUser,
  cleanupTestUser,
  createTask,
} from "../test-utils/user-testing-utils";

// Define test user objects with unique names and emails
const TEST_USER_BOB = {
  name: "Bob (Test User)",
  email: "test-user.bob@pixegami.io",
  password: "Test123!@#Bob",
};

const TEST_USER_CHARLIE = {
  name: "Charlie (Test User)",
  email: "test-user.charlie@pixegami.io",
  password: "Test123!@#Charlie",
};

describe("Suite 2: Test Auth Use Cases", () => {
  let testUserBob: TestUser;
  let testUserCharlie: TestUser;

  // Setup test users before running tests
  beforeAll(async () => {
    // Create or get existing test user for Bob
    testUserBob = await getOrCreateTestUser(TEST_USER_BOB);
    // Create or get existing test user for Charlie
    testUserCharlie = await getOrCreateTestUser(TEST_USER_CHARLIE);
  }, 15_000);

  // Cleanup test users after running tests
  afterAll(async () => {
    // Delete Bob's test user if it exists
    if (testUserBob) {
      await cleanupTestUser(testUserBob.id);
    }
    // Delete Charlie's test user if it exists
    if (testUserCharlie) {
      await cleanupTestUser(testUserCharlie.id);
    }
  }, 15_000);

  test("user cannot edit tasks of other users", async () => {
    // Create a task as Bob
    const { error: createError, data: createData } = await createTask(
      testUserBob,
      "Test Task"
    );
    expect(createError).toBeFalsy();
    expect(createData).toBeTruthy();

    const task = createData![0];
    const taskId = task.task_id;

    // Switch to Charlie's account
    await supabase.auth.signInWithPassword({
      email: TEST_USER_CHARLIE.email,
      password: TEST_USER_CHARLIE.password,
    });

    // Try to read Bob's task as Charlie - should fail
    const { error: readError, data: readData } = await supabase
      .from("tasks")
      .select("*")
      .eq("task_id", taskId);
    expect(readData).toHaveLength(0);
  }, 15_000);

  test("can get jwt auth token for logged in user", async () => {
    // Ensure the test user exists
    await getOrCreateTestUser(TEST_USER_BOB);

    // Sign in with test user credentials
    const { data, error } = await supabaseServiceClient.auth.signInWithPassword({
      email: TEST_USER_BOB.email,
      password: TEST_USER_BOB.password,
    });

    // Verify successful authentication
    expect(data).toBeTruthy();
    expect(error).toBeFalsy();

    // Extract and verify JWT token
    const token = data.session?.access_token;
    expect(token).toBeDefined();
    console.log("Retrieved token:", token);
  }, 15_000);
});