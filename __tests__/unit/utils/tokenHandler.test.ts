import { type TokenHandlerInterface } from "@src/types/utils/TokenHandlerInterface";
import { type Request, type Response, type NextFunction } from "express";
import JWT from "jsonwebtoken";
import TokenHandler from "@src/utils/tokenHandler";

describe('TokenHandler', () => {

  let tokenHandler: TokenHandlerInterface;
  let spy: jest.SpyInstance;

  beforeEach(() => {
    tokenHandler = new TokenHandler();
    global.console.error = jest.fn();
  });

  afterAll(() => {
    jest.clearAllMocks();
  })

  describe('generateToken', () => {
    test('should not generate a token', () => {
      spy = jest.spyOn(JWT, 'sign');

      const token: string | false = tokenHandler.generateToken('');
  
      expect(token).toBe(false);
      expect(spy).not.toHaveBeenCalled();
      expect(global.console.error).toHaveBeenCalled();
    });
  
    test('should generate a token', () => {
      spy = jest.spyOn(JWT, 'sign');

      const token: string | false = tokenHandler.generateToken('admin1234');
  
      expect(token).not.toBe(false);
      expect(spy).toHaveBeenCalled();
      expect(global.console.error).not.toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {

    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        headers: {}
      };
      res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis()
      };
      next = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    })

    test('should not validate the token if the token is missing', () => {
      req.headers['Authorization'] = 'Bearer ';

      tokenHandler.validateToken(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token missing', status: false });
    });
  });

});