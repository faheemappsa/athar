import { useEffect, useState } from "react";

export default function AppIntro() {
  const [show, setShow] = useState(() => sessionStorage.getItem("athar-intro-seen") !== "true");

  useEffect(() => {
    if (!show) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("athar-intro-seen", "true");
      setShow(false);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-primary-bg">
      <div className="text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-[34px] bg-action text-5xl font-bold text-white shadow-2xl">
          أ
        </div>
        <p className="mt-5 text-3xl font-bold text-primary-text">أثر</p>
        <p className="mt-2 text-sm text-secondary-text">صدقة جارية</p>
      </div>
    </div>
  );
}
