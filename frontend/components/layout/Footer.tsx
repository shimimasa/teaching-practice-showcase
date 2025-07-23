import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サイト情報 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              サイト情報
            </h3>
            <p className="mt-4 text-sm text-gray-600">
              学校に通えない子どもたちのための授業実践紹介プラットフォーム
            </p>
          </div>

          {/* リンク */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              リンク
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  このサイトについて
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* 教育者向け */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              教育者の方へ
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/educator-guide" className="text-sm text-gray-600 hover:text-gray-900">
                  教育者ガイド
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                  新規登録
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  ログイン
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} 授業実践紹介プラットフォーム. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}