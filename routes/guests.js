import express from 'express';
import GuestsController from '../controllers/guests.js';
const router = express.Router();

router.post('/create', GuestsController.Create);
router.get('/authenticate', GuestsController.Authenticate);
router.put('/update', GuestsController.Update);
router.put('/delete', GuestsController.Delete);

export default router;
