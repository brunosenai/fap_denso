import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const serialized = serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1, // Data negativa faz o cookie expirar imediatamente
        path: '/'
    });

    res.setHeader('Set-Cookie', serialized);
    res.status(200).json({ message: "Logout success" });
}