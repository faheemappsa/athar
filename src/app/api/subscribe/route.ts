import { NextRequest, NextResponse } from "next/server";

// تخزين الاشتراكات مؤقتاً (في الإنتاج استخدم قاعدة بيانات)
declare global {
  var pushSubscriptions: any[];
}

if (!global.pushSubscriptions) {
  global.pushSubscriptions = [];
}

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();
    global.pushSubscriptions.push(subscription);
    console.log("✅ New subscription added, total:", global.pushSubscriptions.length);
    return NextResponse.json({ success: true, count: global.pushSubscriptions.length });
  } catch (error) {
    console.error("❌ Failed to subscribe:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ count: global.pushSubscriptions.length });
}
