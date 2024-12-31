import { type TokenHandlerInterface } from '@src/types/TokenHandlerInterface';
import { type TestsRepositoryInterface } from '@src/types/TestsRepositoryInterface';
import { type TestsControllerInterface } from '@src/types/TestsControllerInterface';
import express, { type Router } from 'express';
import { TestsRepository } from '../repositories/TestsRepository';
import TestsController from '../controllers/tests';
import TokenHandler from '../utils/tokenHandler';
import db from "../../db";

const repository: TestsRepositoryInterface = new TestsRepository(db);
const tokenHandler: TokenHandlerInterface = new TokenHandler();
const testsController: TestsControllerInterface = new TestsController(repository, tokenHandler);
const router: Router = express.Router();

// POST
router.post('/create', tokenHandler.validateToken, testsController.create);

// GET
router.get('/oneById', tokenHandler.validateToken, testsController.findOneById);
router.get('/all', tokenHandler.validateToken, testsController.findAll);
router.get('/allByAdmin', tokenHandler.validateToken, testsController.findAllByAdmin);

// PUT
router.put('/update', tokenHandler.validateToken, testsController.update);

// DELETE
router.delete('/delete', tokenHandler.validateToken, testsController.delete);

export default router;
