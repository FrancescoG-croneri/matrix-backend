import express, { type Router } from 'express';
import { UsersRepositoryInterface } from '@src/types/UsersRepositoryInterface';
import { UsersControllerInterface } from '@src/types/UsersControllerInterface';
import { TokenHandlerInterface } from '@src/types/TokenHandler';
import { UsersRepository } from '@src/repositories/UsersRepository';
import UsersController from '../controllers/users';
import TokenHandler from '@src/utils/tokenHandler';
import db from '../../db';

const repository: UsersRepositoryInterface = new UsersRepository(db);
const tokenHandler: TokenHandlerInterface = new TokenHandler();
const usersController: UsersControllerInterface = new UsersController(repository, tokenHandler);
const router: Router = express.Router();

// POST
router.post('/create', usersController.create);
router.post('/authenticate', usersController.authenticate);

// GET
router.get('/oneByEmail', usersController.findOneByEmail);
router.get('/oneById',  usersController.findOneById);
router.get('/all', usersController.findAll);

// PUT
router.put('/update', usersController.update);

// DELETE
router.delete('/delete', usersController.delete);

export default router;

// TokenHandler.validateToken,