import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Candy, LogOut, Settings, User, ShieldCheck } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
            <Candy className="h-5 w-5" />
          </div>
          <span className="font-serif font-semibold text-xl">Sweet Shop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" data-testid="link-nav-shop">
            <span
              className={`text-sm font-medium transition-colors ${
                location === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Shop
            </span>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" data-testid="link-nav-admin">
              <span
                className={`text-sm font-medium transition-colors ${
                  location === "/admin" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium" data-testid="text-username">{user.username}</p>
                    <div className="flex items-center gap-2">
                      {user.role === "admin" ? (
                        <Badge variant="default" className="text-xs">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <User className="w-3 h-3 mr-1" />
                          User
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer" data-testid="link-admin-dropdown">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild data-testid="button-login">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
