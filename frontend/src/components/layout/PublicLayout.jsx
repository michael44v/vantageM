import Navbar from "./Navbar";
import Footer from "./Footer";
import Ticker from "./Ticker";

export default function PublicLayout({ children, showTicker = true }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showTicker && (
        <div className="fixed top-[72px] left-0 right-0 z-40">
          <Ticker />
        </div>
      )}
      <main className="flex-1" style={{ paddingTop: showTicker ? "calc(72px + 40px)" : "72px" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
