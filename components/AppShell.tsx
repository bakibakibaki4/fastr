import TabBar from "./TabBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="screen">{children}</div>
      <TabBar />
    </div>
  );
}
