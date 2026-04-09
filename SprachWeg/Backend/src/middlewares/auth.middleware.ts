import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/user.model';

interface JwtPayload {
    id: string;
    role: string;
}

import { IUser } from '../models/user.model';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            (req as any).user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const isAuth = protect;

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user && (req as any).user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!(req as any).user || !roles.includes((req as any).user.role)) {
            return res.status(403).json({ message: `User role ${(req as any).user?.role} is not authorized to access this route` });
        }
        next();
    };
};
