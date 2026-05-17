import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import type { Metadata } from "next";
import CustomCursor from "@/components/CustomCursor";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Bash | Modern Web Development, AI & Robotics Solutions",
  description: "Bash is a technology company specializing in high-performance web development, AI & Machine Learning, Robotics, and 3D Printing solutions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6cf2cf",
          colorBackground: "#151a20",
          colorInputBackground: "#050608",
          colorInputText: "#dce4ee",
          colorText: "#dce4ee",
          fontFamily: "'Space Grotesk', sans-serif",
        },
        elements: {
          card: "border border-white/10 bg-[#151a20] shadow-2xl",
          formButtonPrimary: "bg-[#6cf2cf] text-[#050608] hover:bg-[#6cf2cf]/90 transition-all font-bold",
          socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white",
          socialButtonsBlockButtonText: "text-white font-medium",
          footerActionLink: "text-[#6cf2cf] hover:text-[#6cf2cf]/80",
          formFieldInput: "bg-[#050608] border-white/10 focus:border-[#6cf2cf] transition-all",
          dividerLine: "bg-white/10",
          dividerText: "text-white/40",
        }
      }}
    >
      <html lang="en">
        <body>
          <CustomCursor />
          <ScrollReveal />
          <header className="site-header">
            <a className="brand" href="/">&lt;/&gt;Bash</a>
            <nav className="site-nav">
              <a href="#about">About</a>
              <a href="#webdev">Services</a>
              <a href="#projects">Projects</a>
              <a href="#contact">Contact</a>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="nav-btn">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="nav-btn accent">Sign Up</button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </nav>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
