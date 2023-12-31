import "./globals.css"
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto-mono";

export const metadata: Metadata = {
  title: "Pixeltracking Web App",
  description: "Generated by create next app",
  viewport: "initial-scale=1, width=device-width"
}

import { ThemeProvider } from "@mui/material/styles";
import { Metadata } from "next";
import { theme } from "./theme";

import {NextIntlClientProvider} from "next-intl";
import {notFound} from "next/navigation";

export function generateStaticParams() {
  return [{locale: "en"}, {locale: "is"}];
}

import Header from "./components/Header";
import { CssBaseline } from "@mui/material";

export default async function RootLayout({
  children, params: {locale}
}: {
  children: React.ReactNode, params: {locale: string}
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
  return (
    <html lang={locale}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <body className="m-0 h-screen bg-slate-200">  
          <NextIntlClientProvider locale={locale} messages={messages}>        
            <Header />
            <main className="flex flex-row " style={{height: "calc(100vh - 64px)"}}>
              {children}
            </main>
          </NextIntlClientProvider>
        </body>
      </ThemeProvider>
    </html>
  )
}
