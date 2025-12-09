import { Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  appName?: string;
  onLogout?: () => void;
  userName?: string;
}

export default function Header({
  appName,
  onLogout,
  userName,
}: HeaderProps) {
  const { t } = useTranslation();
  const displayAppName = appName || t('common.appName');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-foreground transition-colors hover:text-primary"
          >
            <Package className="h-6 w-6 text-primary" />
            {displayAppName}
          </NavLink>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <NavLink
              to="/quote"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeClassName="text-foreground font-semibold"
            >
              {t('navigation.newQuote')}
            </NavLink>
            <NavLink
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeClassName="text-foreground font-semibold"
            >
              {t('navigation.dashboard')}
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {userName && (
            <span className="text-sm text-muted-foreground">
              {userName}
            </span>
          )}
          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="gap-2"
              aria-label={t('auth.logout')}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('auth.logout')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
