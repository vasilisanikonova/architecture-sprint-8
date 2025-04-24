
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import { Request, Response, NextFunction } from 'express';

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {

    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader ? authHeader.split(' ')[1] : undefined;

        if (!token) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }

        const keycloakUrl = process.env.KEYCLOAK_URL;
        const realm = process.env.KEYCLOAK_REALM;

        const jwksUri = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`;
        const client = jwksClient({ jwksUri });

        const decoded: any = jwt.decode(token, { complete: true });

        if (!decoded || typeof decoded === 'string') {
            res.status(401).json({ error: 'Invalid token format' });
            return;
        }

        const kid = decoded.header.kid;

        client.getSigningKey(kid, (err, key) => {
            if (err) {
                res.status(401).json({ error: 'Could not get signing key' });
                return;
            }

            const publicKey = key && "getPublicKey" in key ? key.getPublicKey() : null;

            if (!publicKey) {
                res.status(401).json({ error: 'Could not get publicKey' });
                return;
            }


            jwt.verify(token, publicKey, (err, payload: any) => {
                if (err || !payload) {
                    res.status(401).json({ error: 'Token verification failed' });
                    return;
                }

                if (!payload.realm_access?.roles?.includes('prothetic_user')) {
                    res.status(403).json({ error: 'Forbidden: Insufficient role' });
                    return;
                }

                (req as any).user = payload;
                next();
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
