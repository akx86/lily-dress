/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // تجهيز الـ Response المبدئي
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // إنشاء Supabase Server Client عشان نقرأ الـ Cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // التحقق من حالة المستخدم الحالي من الـ Cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  // تعريف المسارات المحمية (أي مسار بيبدأ بدول)
  const isAdminRoute =
    currentPath.startsWith("/dresses") ||
    currentPath.startsWith("/categories") ||
    currentPath.startsWith("/settings");

  // القاعدة الأولى: لو بيحاول يدخل لوحة التحكم ومش مسجل دخول -> اطرده للوجين
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // القاعدة الثانية: لو هو مسجل دخول بالفعل وبيحاول يفتح صفحة اللوجين -> دخله للوحة التحكم فوراً
  if (currentPath === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dresses";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// الـ Matcher ده بيقول لـ Next.js إيه الملفات اللي الميدلوير يشتغل عليها
// (هنا بنستثني ملفات النظام، الصور، والـ CSS عشان منبطأش الموقع)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
