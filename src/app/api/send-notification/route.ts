import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

declare global {
  var pushSubscriptions: any[];
}

// إعداد VAPID من متغيرات البيئة
webpush.setVapidDetails(
  "mailto:support@athar-app.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { title, body } = await req.json();
    const subscriptions = global.pushSubscriptions || [];

    if (subscriptions.length === 0) {
      return NextResponse.json({ success: false, message: "No subscriptions" });
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(sub, JSON.stringify({ title, body }))
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ success: true, sent, total: subscriptions.length });
  } catch (error) {
    console.error("❌ Failed to send notifications:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
