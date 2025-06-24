import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Booking Lapangan Basket/Tenis Lotus Palace",
  description: "Booking Lapangan Basket/Tenis Lotus Palace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen dark`}
        style={{
          backgroundImage: 'url("/images/bg.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Page content */}
        <div className="absolute inset-0 bg-black opacity-50 -z-10" />
        {children}
      </body>
    </html>
  );
}
