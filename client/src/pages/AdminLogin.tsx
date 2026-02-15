import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, type AdminLogin } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/lib/adminContext";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { setAdmin } = useAdmin();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLogin) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log("Login response:", response);
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const result = await response.json();
      setAdmin(result.admin);
      setLocation("/admin/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-card-border/60">
        <CardHeader className="text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <img src={fyndoLogo} alt="FYNDO" className="h-10" data-testid="img-logo" />
            <span className="text-sm font-medium text-muted-foreground">Admin Panel</span>
          </div>
          <CardDescription>
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="admin"
                        data-testid="input-username"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter password"
                        data-testid="input-password"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
