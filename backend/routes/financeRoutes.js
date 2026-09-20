import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import {
  getOverviewHandler,
  getSettingsHandler,
  updateSettingsHandler,
  getCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  getTransactionsHandler,
  createTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
} from '../controllers/financeController.js';

const router = Router();

router.use(verifyToken);

router.get('/overview', getOverviewHandler);

router.get('/settings', getSettingsHandler);
router.patch('/settings', updateSettingsHandler);

router.get('/categories', getCategoriesHandler);
router.post('/categories', createCategoryHandler);
router.patch('/categories/:id', updateCategoryHandler);
router.delete('/categories/:id', deleteCategoryHandler);

router.get('/transactions', getTransactionsHandler);
router.post('/transactions', createTransactionHandler);
router.patch('/transactions/:id', updateTransactionHandler);
router.delete('/transactions/:id', deleteTransactionHandler);

export default router;
