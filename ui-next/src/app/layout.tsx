import { Inter } from "next/font/google";
import "./globals.css";
import Authenticated from "@/common/auth/Authenticated";
import React from "react";
import {ChildOnlyParameterType} from "@/common/next-interfaces";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Big React App",
  description: "An application to learn React",
};

export default function RootLayout({ children }: ChildOnlyParameterType): React.JSX.Element {
  return (
      <html lang="en">
      <body className={inter.className}>
      <Authenticated message="Root component">
        {children}
      </Authenticated>
      </body>
      </html>
  );
}
