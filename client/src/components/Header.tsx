/**
 * Header Component
 * Navigation bar with user profile and notifications
 * Improved layout with better spacing and organization
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, LogOut, User, LogIn, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Header() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignIn = () => {
    signIn({
      id: `user-${Date.now()}`,
      name: 'Иван Петров',
      avatarUrl: undefined,
    });
    toast.success('Вы вошли в систему');
  };

  const handleSignOut = () => {
    signOut();
    toast.success('Вы вышли из системы');
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const [a = '', b = ''] = name.trim().split(/\s+/);
    return (a[0] ?? '') + (b[0] ?? '');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      {/* Main Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              RA
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">Harbor</h1>
              <p className="text-xs text-muted-foreground">Управление ресурсами</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <nav className="flex items-center gap-1">
              <a href="#" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
                Каталог
              </a>
              <a href="#" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
                Расписание
              </a>
              <a href="#" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
                Статистика
              </a>
              <a href="#" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
                Данные
              </a>
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-accent rounded-lg transition-colors text-foreground"
              title="Уведомления"
              aria-label="Уведомления"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-border" />

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent rounded-lg transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-md group-hover:shadow-lg transition-shadow">
                      {getInitials(user.name)}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground">{user.name || 'Пользователь'}</span>
                      <span className="text-xs text-muted-foreground">Администратор</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">администратор@example.com</p>
                  </div>
                  <DropdownMenuItem className="gap-2 py-2">
                    <User className="w-4 h-4" />
                    <span>Профиль</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 py-2">
                    <span>⚙️</span>
                    <span>Настройки</span>
                  </DropdownMenuItem>
                  <div className="border-t border-border my-1" />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 py-2 text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" />
                    <span>Выход</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleSignIn} size="sm" className="gap-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Вход</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 hover:bg-accent rounded-lg transition-colors"
              aria-label="Меню"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="flex flex-col gap-1 px-4 py-3">
            <a href="#" className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
              Каталог
            </a>
            <a href="#" className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
              Расписание
            </a>
            <a href="#" className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
              Статистика
            </a>
            <a href="#" className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
              Данные
            </a>
          </nav>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="border-t border-border bg-card">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Уведомления</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-background border border-border">
                <p className="text-sm text-muted-foreground">Нет новых уведомлений</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
