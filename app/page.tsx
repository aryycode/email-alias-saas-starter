"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Code,
  Database,
  Shield,
  Zap,
  Globe,
  Palette,
  Package,
  Mail,
  Server,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-16 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent mb-6">
            Email Alias SaaS Platform
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 mb-8">
            Create custom email aliases, manage multiple domains, and receive secure inbound emails all in one powerful dashboard. Perfect for businesses and professionals who need email privacy and organization.
          </p>

          <HeroAuthButtons />
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-8 max-w-5xl">
        {/* Project Overview */}
        <div className="text-center mb-8">
          <div className="text-4xl sm:text-5xl mb-2">🚀</div>
          <div className="font-bold text-lg sm:text-xl mb-2">Modern Full-Stack Starter</div>
          <div className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            This project includes everything you need to build a modern web application with TypeScript, 
            authentication, database integration, and a beautiful UI component library.
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Frontend */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200/50 dark:border-blue-700/30">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-lg">Frontend</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Next.js 15</strong> - React framework with App Router</li>
              <li>• <strong>React 19</strong> - Latest React with concurrent features</li>
              <li>• <strong>TypeScript</strong> - Type-safe development</li>
              <li>• <strong>Turbopack</strong> - Fast bundling and dev server</li>
            </ul>
          </Card>

          {/* UI & Styling */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200/50 dark:border-purple-700/30">
            <div className="flex items-center gap-3 mb-3">
              <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-lg">UI & Styling</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Tailwind CSS 4</strong> - Utility-first CSS framework</li>
              <li>• <strong>Radix UI</strong> - Accessible component primitives</li>
              <li>• <strong>Lucide Icons</strong> - Beautiful icon library</li>
              <li>• <strong>Dark Mode</strong> - Built-in theme switching</li>
            </ul>
          </Card>

          {/* Authentication */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200/50 dark:border-green-700/30">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-lg">Authentication</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Better Auth</strong> - Modern auth solution</li>
              <li>• <strong>Session Management</strong> - Secure user sessions</li>
              <li>• <strong>Type Safety</strong> - Fully typed auth hooks</li>
              <li>• <strong>Multiple Providers</strong> - Social login support</li>
            </ul>
          </Card>

          {/* Database */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border-cyan-200/50 dark:border-cyan-700/30">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-semibold text-lg">Database</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>PostgreSQL</strong> - Robust relational database</li>
              <li>• <strong>Drizzle ORM</strong> - Type-safe database toolkit</li>
              <li>• <strong>Docker Setup</strong> - Containerized development</li>
              <li>• <strong>Migrations</strong> - Schema version control</li>
            </ul>
          </Card>

          {/* Development */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border-orange-200/50 dark:border-orange-700/30">
            <div className="flex items-center gap-3 mb-3">
              <Code className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-lg">Development</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>ESLint</strong> - Code linting and formatting</li>
              <li>• <strong>Hot Reload</strong> - Instant development feedback</li>
              <li>• <strong>Docker</strong> - Consistent dev environment</li>
              <li>• <strong>npm Scripts</strong> - Automated workflows</li>
            </ul>
          </Card>

          {/* Components */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-200/50 dark:border-indigo-700/30">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-lg">Components</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Form Handling</strong> - React Hook Form + Zod</li>
              <li>• <strong>Data Visualization</strong> - Recharts integration</li>
              <li>• <strong>Date Pickers</strong> - Beautiful date components</li>
              <li>• <strong>Notifications</strong> - Toast and alert systems</li>
            </ul>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Start
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Development</h4>
              <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 font-mono text-sm">
                <div>npm install</div>
                <div>npm run db:dev</div>
                <div>npm run dev</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Production</h4>
              <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 font-mono text-sm">
                <div>npm run build</div>
                <div>npm run start</div>
                <div>npm run docker:up</div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Powerful Email Management Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your email aliases and domains securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Custom Domains Feature */}
            <Card className="flex flex-col items-center text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom Domains</h3>
              <p className="text-muted-foreground leading-relaxed">
                Add your own custom domains and create professional email aliases. Support for multiple domains with DNS verification and SSL security.
              </p>
            </Card>

            {/* Alias Management Feature */}
            <Card className="flex flex-col items-center text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Alias Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create and manage unlimited email aliases. Organize your communications with descriptive names and track all incoming messages in one place.
              </p>
            </Card>

            {/* Secure Inbound Email Feature */}
            <Card className="flex flex-col items-center text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Inbound Email</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive emails securely through our encrypted webhook system. All attachments are safely stored and your data is protected with enterprise-grade security.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
