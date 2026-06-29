import { Inter, Poppins } from "next/font/google";
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { brandMetadata } from "@/components/brand/brandIdentity";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/modules/auth';
import { AppFeedbackProvider } from '@/shared/providers/AppFeedbackProvider';
import { WorkspaceTheme } from '@/shared/providers/WorkspaceTheme';

const inter = Inter({
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  ...brandMetadata,
  icons: {
    icon: "/images/brand/nexera-icon.svg",
    apple: "/images/brand/nexera-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${poppins.variable} dark:bg-gray-900`}>
        <AuthProvider>
          <AppFeedbackProvider>
            <ThemeProvider>
              <WorkspaceTheme>
                <SidebarProvider>{children}</SidebarProvider>
              </WorkspaceTheme>
            </ThemeProvider>
          </AppFeedbackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
