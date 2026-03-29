import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet } from "lucide-react";
import { COUNTRIES } from "@/data/mockData";
import { toast } from "sonner";

const SignupPage = () => {
  const { signup } = useAuth();
  const [form, setForm] = useState({ company: "", country: "", name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<string[]>(COUNTRIES);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name");
        const payload = (await response.json()) as Array<{ name?: { common?: string } }>;
        const dynamicCountries = payload
          .map((row) => row.name?.common)
          .filter((value): value is string => Boolean(value))
          .sort((a, b) => a.localeCompare(b));

        if (dynamicCountries.length) {
          setCountries(dynamicCountries);
        }
      } catch {
        setCountries(COUNTRIES);
      }
    };

    void loadCountries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.country || !form.name || !form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>Set up your company reimbursement portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select onValueChange={(v) => update("country", v)}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Admin Name</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Alex Johnson" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="alex@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
