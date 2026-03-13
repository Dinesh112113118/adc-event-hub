import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Mock users for demo
const MOCK_USERS = [
  { username: "admin", password: "admin123", role: "admin", name: "Admin User" },
  { username: "scanner", password: "scanner123", role: "scanner", name: "Scanner User" },
];

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        localStorage.setItem("adc_user", JSON.stringify(user));
        toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
        navigate(user.role === "admin" ? "/admin" : "/scanner");
      } else {
        toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <div className="w-full max-w-sm animate-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">ATC Events</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage events</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted p-2">
                <p className="font-medium">Admin</p>
                <p className="text-muted-foreground">admin / admin123</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="font-medium">Scanner</p>
                <p className="text-muted-foreground">scanner / scanner123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
