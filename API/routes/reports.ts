
import { Router, Request, Response } from 'express';
import {authenticateToken} from "../src/auth";


const router = Router();

router.get('/', authenticateToken, (req: Request, res: Response) => {
    const fakeReport = {
        userId: (req as any).user?.sub || 'unknown',
        date: new Date().toISOString(),
        usage: {
            steps: Math.floor(Math.random() * 1000),
            averageSignalStrength: (Math.random() * 100).toFixed(2),
            batteryDrain: (Math.random() * 20 + 5).toFixed(2),
        },
    };

    res.status(200).json(fakeReport);
});

export default router;