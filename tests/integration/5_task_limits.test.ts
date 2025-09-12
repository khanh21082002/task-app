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
    await cleanupTestUser(testUser.id);
  });

  const setupTestEnvironment = async (tier: string, taskCount: number) => {
    await setUserSubscriptionTier(testUser.id, tier);
    await setTasksCreatedCount(testUser.id, taskCount);
  };

  describe("Free Tier", () => {
    test("can create task within limit", async () => {
      await setupTestEnvironment("free", 0);
      const { error: taskCreationError } = await createTask(testUser, "Free Task (Within Limit)");
      expect(taskCreationError).toBeFalsy();
    });

    test("cannot create task when limit is reached", async () => {
      await setupTestEnvironment("free", TASK_LIMITS.FREE_TIER);
      const { error: taskCreationError } = await createTask(testUser, "Free Task (Limit Reached)");
      expect(taskCreationError).toBeTruthy();
    });
  });

  describe("Premium Tier", () => {
    test("can create task within limit", async () => {
      await setupTestEnvironment("premium", TASK_LIMITS.FREE_TIER);
      const { error: taskCreationError } = await createTask(testUser, "Premium Task (Within Limit)");
      expect(taskCreationError).toBeFalsy();
    });

    test("cannot create task when limit is reached", async () => {
      await setupTestEnvironment("premium", TASK_LIMITS.PREMIUM_TIER);
      const { error: taskCreationError } = await createTask(testUser, "Premium Task (Limit Reached)");
      expect(taskCreationError).toBeTruthy();
    });
  });
});