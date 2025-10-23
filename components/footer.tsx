"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-center gap-8" aria-label="Footer navigation">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-2 py-1"
          >
            Dashboard
          </Link>
          <Link
            href="/docs"
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-2 py-1"
          >
            Docs
          </Link>
        </nav>
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>&copy; 2024 Email Alias SaaS Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}