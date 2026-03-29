import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("alex@acmecorp.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }

    setSendingReset(true);
    try {
      await api.forgotPassword(email);
      toast.success("Password reset token sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset token");
    } finally {
      setSendingReset(false);
    }
  };

  const handleEmployeeLogin = async () => {
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Employee/User signed in successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your reimbursement portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" disabled={sendingReset} className="text-xs text-primary hover:underline disabled:opacity-60" onClick={handleForgotPassword}>
                  {sendingReset ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
            <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={handleEmployeeLogin}>
              Login as Employee / Other User
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
