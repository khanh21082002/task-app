import {
  setUserSubscriptionPlan as setUserSubscriptionTier,
  setTaskCount as setTasksCreatedCount,
  TASK_LIMITS,
} from "../test-utils/limit-testing-utils";

import {
  TestUser,
  getOrCreateTestUser,
  cleanupTestUser,
  createTask,
} from "../test-utils/user-testing-utils";

const TEST_USER_CREDENTIALS = {
  name: "Frank (Test User)",
  email: "test-user.frank@pixegami.io",
  password: "Test123!@#Frank",
};

describe("Suite 5: Task Limits and Premium Features", () => {
  let testUser: TestUser;
  beforeAll(async () => {
    testUser = await getOrCreateTestUser(TEST_USER_CREDENTIALS);
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  });

  test("free user can create task within limit", async () => {
    await setUserSubscriptionTier(testUser.id, "free");
    await setTaskCount(testUser.id, 0);
    const { error: expectedError } = await createTask(testUser, "Free Task (Within Limit)");
    expect(expectedError).toBeFalsy();
  });

  test("free user cannot create task when limit is reached", async () => {
    await setUserSubscriptionTier(testUser.id, "free");
    await setTaskCount(testUser.id, TASK_LIMITS.FREE_TIER);
    const { error: expectedError } = await createTask(
      testUser,
      "Free Task (Limit Reached)"
    );
    expect(expectedError).toBeTruthy();
  });

  test("premium user can create task within premium limit", async () => {
    await setUserSubscriptionTier(testUser.id, "premium");
    await setTaskCount(testUser.id, TASK_LIMITS.FREE_TIER);
    const { error: expectedError } = await createTask(
      testUser,
      "Premium Task (Within Limit)"
    );
    expect(expectedError).toBeFalsy();
  });

  test("premium user cannot create task when premium limit is reached", async () => {
    await setUserSubscriptionTier(testUser.id, "premium");
    await setTaskCount(testUser.id, TASK_LIMITS.PREMIUM_TIER);
    const { error: expectedError } = await createTask(
      testUser,
      "Premium Task (Limit Reached)"
    );
    expect(expectedError).toBeTruthy();
  });
});