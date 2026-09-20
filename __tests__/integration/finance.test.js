const axios = require('axios');
const { BASE_URL, waitForBackend, makeCredentials } = require('./helpers');

describe('Finance API', () => {
  const creds = makeCredentials();
  let accessToken = null;
  let userId = null;

  const authHeaders = () => ({ Authorization: `Bearer ${accessToken}` });

  beforeAll(async () => {
    await waitForBackend();
    const res = await axios.post(`${BASE_URL}/api/users/register`, creds);
    accessToken = res.data.token;
    userId = res.data.user._id;
  }, 60_000);

  afterAll(async () => {
    if (userId && accessToken) {
      await axios.delete(`${BASE_URL}/api/users/me`, {
        headers: authHeaders(),
        validateStatus: null,
      });
    }
  });

  describe('Unauthenticated guards', () => {
    test('GET /api/finance/overview without token returns 401', async () => {
      const res = await axios.get(`${BASE_URL}/api/finance/overview`, { validateStatus: null });
      expect(res.status).toBe(401);
    });

    test('POST /api/finance/transactions without token returns 401', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/finance/transactions`,
        {
          title: 'Test',
          amount: 10,
          type: 'expense',
          category: '000000000000000000000000',
          date: '2026-01-01',
        },
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });
  });

  describe('Category seeding', () => {
    let categories;

    test('GET /api/finance/categories lazily seeds the 7 defaults', async () => {
      const res = await axios.get(`${BASE_URL}/api/finance/categories`, { headers: authHeaders() });
      expect(res.status).toBe(200);
      categories = res.data.data;
      expect(categories).toHaveLength(7);
      const slugs = categories.map((c) => c.slug).sort();
      expect(slugs).toEqual(
        ['entertainment', 'food', 'health', 'other', 'rent', 'shopping', 'transport'].sort(),
      );
    });

    test('rent is seeded with excludeFromBudget true, other categories false', () => {
      const rent = categories.find((c) => c.slug === 'rent');
      const food = categories.find((c) => c.slug === 'food');
      expect(rent.excludeFromBudget).toBe(true);
      expect(food.excludeFromBudget).toBe(false);
    });
  });

  describe('Full flow: transactions, budget math, category deletion', () => {
    let categories;
    let rentCategoryId;
    let otherCategoryId;
    let customCategoryId;
    let rentTransactionId;

    beforeAll(async () => {
      const res = await axios.get(`${BASE_URL}/api/finance/categories`, { headers: authHeaders() });
      categories = res.data.data;
      rentCategoryId = categories.find((c) => c.slug === 'rent')._id;
      otherCategoryId = categories.find((c) => c.slug === 'other')._id;
    });

    test('POST /api/finance/categories creates a custom category', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/finance/categories`,
        { name: 'Custom Stuff', color: '#123456', excludeFromBudget: false },
        { headers: authHeaders() },
      );
      expect(res.status).toBe(201);
      expect(res.data.data.name).toBe('Custom Stuff');
      customCategoryId = res.data.data._id;
    });

    test('POST /api/finance/transactions creates a rent (excluded) transaction', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await axios.post(
        `${BASE_URL}/api/finance/transactions`,
        {
          title: 'Monthly rent',
          amount: 500,
          type: 'expense',
          category: rentCategoryId,
          date: today,
        },
        { headers: authHeaders() },
      );
      expect(res.status).toBe(201);
      rentTransactionId = res.data.data._id;
    });

    test('POST /api/finance/transactions creates a food (budget-relevant) transaction', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const foodCategoryId = categories.find((c) => c.slug === 'food')._id;
      const res = await axios.post(
        `${BASE_URL}/api/finance/transactions`,
        { title: 'Groceries', amount: 25, type: 'expense', category: foodCategoryId, date: today },
        { headers: authHeaders() },
      );
      expect(res.status).toBe(201);
    });

    test('GET /api/finance/overview excludes rent from monthlySpend but includes it in monthlySpendAll', async () => {
      const res = await axios.get(`${BASE_URL}/api/finance/overview`, { headers: authHeaders() });
      expect(res.status).toBe(200);
      const overview = res.data.data;
      expect(overview.monthlySpend).toBe(25);
      expect(overview.monthlySpendAll).toBe(525);
      expect(typeof overview.dailyBudget).toBe('number');
    });

    test('creating an expense automatically decreases the balance', async () => {
      const res = await axios.get(`${BASE_URL}/api/finance/settings`, { headers: authHeaders() });
      // Rent (500) + Groceries (25) = 525 spent so far, starting balance 0
      expect(res.data.data.balance).toBe(-525);
    });

    test('PATCH /api/finance/transactions/:id updates a transaction and adjusts the balance by the delta', async () => {
      const res = await axios.patch(
        `${BASE_URL}/api/finance/transactions/${rentTransactionId}`,
        { amount: 600 },
        { headers: authHeaders() },
      );
      expect(res.status).toBe(200);
      expect(res.data.data.amount).toBe(600);

      const settingsRes = await axios.get(`${BASE_URL}/api/finance/settings`, {
        headers: authHeaders(),
      });
      // rent went from 500 to 600, an extra -100 on top of the previous -525
      expect(settingsRes.data.data.balance).toBe(-625);
    });

    test('POST a transaction under the custom category, then delete the category reassigns it to other', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const created = await axios.post(
        `${BASE_URL}/api/finance/transactions`,
        {
          title: 'Custom spend',
          amount: 5,
          type: 'expense',
          category: customCategoryId,
          date: today,
        },
        { headers: authHeaders() },
      );
      expect(created.status).toBe(201);
      const transactionId = created.data.data._id;

      const del = await axios.delete(`${BASE_URL}/api/finance/categories/${customCategoryId}`, {
        headers: authHeaders(),
      });
      expect(del.status).toBe(204);

      const list = await axios.get(`${BASE_URL}/api/finance/transactions`, {
        headers: authHeaders(),
      });
      const reassigned = list.data.data.transactions.find((t) => t._id === transactionId);
      expect(reassigned.category.slug).toBe('other');
      expect(reassigned.category._id).toBe(otherCategoryId);
    });

    test("DELETE /api/finance/categories/:id on the 'other' category returns 400", async () => {
      const res = await axios.delete(`${BASE_URL}/api/finance/categories/${otherCategoryId}`, {
        headers: authHeaders(),
        validateStatus: null,
      });
      expect(res.status).toBe(400);
    });

    test('DELETE /api/finance/transactions/:id removes the transaction and reverses its balance effect', async () => {
      const before = await axios.get(`${BASE_URL}/api/finance/settings`, {
        headers: authHeaders(),
      });

      const res = await axios.delete(`${BASE_URL}/api/finance/transactions/${rentTransactionId}`, {
        headers: authHeaders(),
      });
      expect(res.status).toBe(204);

      const list = await axios.get(`${BASE_URL}/api/finance/transactions`, {
        headers: authHeaders(),
      });
      const found = list.data.data.transactions.some((t) => t._id === rentTransactionId);
      expect(found).toBe(false);

      const after = await axios.get(`${BASE_URL}/api/finance/settings`, { headers: authHeaders() });
      // Deleting a 600 expense should add 600 back to the balance
      expect(after.data.data.balance).toBe(before.data.data.balance + 600);
    });
  });

  describe('Ownership checks', () => {
    const otherCreds = makeCredentials();
    let otherToken = null;
    let otherUserId = null;
    let myCategoryId = null;

    beforeAll(async () => {
      const res = await axios.post(`${BASE_URL}/api/users/register`, otherCreds);
      otherToken = res.data.token;
      otherUserId = res.data.user._id;

      const categoriesRes = await axios.get(`${BASE_URL}/api/finance/categories`, {
        headers: authHeaders(),
      });
      myCategoryId = categoriesRes.data.data.find((c) => c.slug === 'food')._id;
    });

    afterAll(async () => {
      if (otherUserId && otherToken) {
        await axios.delete(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${otherToken}` },
          validateStatus: null,
        });
      }
    });

    test("another user's token cannot delete this user's category", async () => {
      const res = await axios.delete(`${BASE_URL}/api/finance/categories/${myCategoryId}`, {
        headers: { Authorization: `Bearer ${otherToken}` },
        validateStatus: null,
      });
      expect(res.status).toBe(403);
    });
  });
});
