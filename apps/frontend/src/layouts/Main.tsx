import { Suspense, useRef } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Menu from "../components/Menu";
import ScrollTopButton from "../components/ScrollTopButton";
import Loader from "../layouts/Loader";

export default function Main() {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="min-h-dvh w-full bg-slate-950 text-white">
      <Header />
      <main className="pb-28" ref={mainRef}>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <ScrollTopButton />
      <Menu />
    </div>
  );
}
