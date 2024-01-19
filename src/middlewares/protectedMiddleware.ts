import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export function protectedRoute(req: Request, res: Response, next: NextFunction) {
  // Paths that are to be excluded from the check
  const pathToExclude = ['auth', 'login', 'signup'];

  // Ignore the check if the path is in the exclusion list
  if (pathToExclude.some((path) => req.path.endsWith(path))) {
    return next();
  }

  // Auth process
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401);
    throw new Error('You must send an Authorization header');
  }

  const [authType, token] = authorization.split(' ');
  if (authType !== 'Bearer') {
    res.status(403);
    throw new Error('Expected a Bearer token');
  }

  verify(token, process.env.APP_SECRET as string, (err) => {
    if (err) {
      res.status(403);
      return next(new Error(err.message));
    }
    next();
  });
}
