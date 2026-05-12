import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { DashboardProvider } from "@/components/dashboard-provider";

export const metadata = {
  title: "Personal Chat",
  description: "Direct personal WhatsApp chat assistant"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DashboardProvider>
          <AppShell>{children}</AppShell>
        </DashboardProvider>
      </body>
    </html>
  );
}
