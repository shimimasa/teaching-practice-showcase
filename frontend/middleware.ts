import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 管理画面へのアクセスをチェック
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('token');

    // トークンがない場合はログインページにリダイレクト
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // TODO: トークンの検証をサーバーサイドで行う
    // 現在は簡易的なチェックのみ
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};