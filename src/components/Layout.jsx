import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import SiteMessageDisplay from "./sitemessages/SiteMessageDisplay";
import BackToTop from "./BackToTop";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <AnimatedBackground />
      <Navbar />
      <SiteMessageDisplay />
      <main className="pt-16 flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}