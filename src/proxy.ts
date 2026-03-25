import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Usamos 'jose' pois 'jsonwebtoken' não roda bem no Edge Runtime

export async function proxy(request: NextRequest) {
    // 1. Tenta pegar o cookie
    const token = request.cookies.get('auth_token')?.value;

    // Se não tiver token, manda pro login
    if (!token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    try {
        // 2. Verifica se o token é válido e foi assinado com sua chave secreta
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        
        // Se passou, deixa carregar a página
        return NextResponse.next();
    } catch (error) {
        // Se o token for inválido ou expirado, manda pro login
        return NextResponse.redirect(new URL('/', request.url));
    }
}

// 3. Configura quais rotas devem ser protegidas
export const config = {
    // Protege /home e qualquer sub-rota dela, e outras rotas que desejar
    matcher: ['/home/:path*', '/fap/:path*', '/selecaomodulo/:path*', '/cadastro/:path*'],
};