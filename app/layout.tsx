import type { Metadata } from "next";
import { Lexend, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/AuthContext';
import { Toaster } from "react-hot-toast";

import { ClerkProvider } from '@clerk/nextjs';

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-lexend",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "GradSkills | Careers",
  description: "Join the team at GradSkills and help shape the future of learning.",
  icons: {
    icon: "https://image2url.com/r2/default/images/1772364686444-9b7d74ff-802f-4f36-8b7e-d7daaedab981.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <AuthProvider>
        <html lang="en">
          <body className={`${lexend.variable} ${poppins.variable} antialiased font-poppins bg-slate-50 text-gray-900`}>
            <Toaster position="top-center" />
            {children}
          </body>
        </html>
      </AuthProvider>
    </ClerkProvider>
  );
}
