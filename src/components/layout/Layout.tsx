import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#0A1628" }}
    >
      <Sidebar />
      <main
        className="flex-1 overflow-auto"
        style={{
          background:
            "linear-gradient(160deg, #0A1628 0%, #0D1E35 50%, #0A1628 100%)",
        }}
      >
        {/* subtle gold top border */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)",
          }}
        />
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
