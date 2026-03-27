import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Mail,
  Lock,
  ArrowRight,
  User2,
  User,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/hospital";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLoginMutation, usePostuserMutation } from "@/features/userSlice";
import { setCredentials } from "@/store/authSlice";
import { useDispatch } from "react-redux";

export default function Login() {
  const [phone_number, setPhone] = useState("0716017221");
  const [password, setPassword] = useState("+254716017221");
  const [postDoctor] = usePostuserMutation({});
  const [item, setItem] = useState({
    name: "",
    phone_number: "0716017221",
    role: "patient",
    password: "+254716017221",
    confirm_password: "",
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterimg, setIsRegisterimg] = useState(false);
  const [login, isFetching] = useLoginMutation({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // const success = await login(email, password, selectedRole);
      if (isRegisterimg) {
        await postDoctor(item).unwrap();
        toast({
          title: "Success",
          description: `Registered  suucessfully `,
        });
        setIsRegisterimg(false);
      } else {
        const res = await login(item).unwrap();
        dispatch(setCredentials({ ...res }));
        // if (res) {
        toast({
          title: "Welcome back!",
          description: `Logged in as ${selectedRole}`,
        });
        navigate("/dashboard");
        // } else {
        //   toast({
        //     title: 'Login failed',
        //     description: 'Invalid credentials. Password must be at least 4 characters.',
        //     variant: 'destructive',
        //   });
        // }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/20 backdrop-blur-sm">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sidebar-foreground">
                LIFECARE
              </h1>
              <p className="text-sm text-sidebar-foreground/60">
                Hospital Management System
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-sidebar-foreground leading-tight">
            Streamline Your
            <br />
            Hospital Operations
          </h2>
          <p className="text-lg text-sidebar-foreground/70 max-w-md">
            Manage patients, appointments, staff, and departments all in one
            powerful platform designed for modern healthcare.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-primary/30 border-2 border-sidebar-background flex items-center justify-center"
                >
                  <User2 className="w-5 h-5 text-primary" />
                </div>
              ))}
            </div>
            <p className="text-sm text-sidebar-foreground/70">
              <span className="font-semibold text-sidebar-foreground">
                500+
              </span>{" "}
              healthcare professionals trust us
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-sidebar-foreground/40">
            © 2024 LIFECARE. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="p-3 rounded-2xl gradient-primary">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">LIFECARE</h1>
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              {isRegisterimg ? "Register" : "Welcome back"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isRegisterimg ? "" : "Sign in to access your dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegisterimg && (
              <div className="space-y-2">
                <Label htmlFor="phone_number">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="james  Kennedy"
                    value={item.name}
                    onChange={(e) =>
                      setItem((pre) => ({
                        ...pre,
                        name: e.target.value,
                      }))
                    }
                    className="pl-11 h-12"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone_number"
                  type="numeric"
                  placeholder="you@hospital.com"
                  value={item.phone_number}
                  onChange={(e) =>
                    setItem((pre) => ({
                      ...pre,
                      phone_number: e.target.value,
                    }))
                  }
                  className="pl-11 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={item.password}
                  onChange={(e) =>
                    setItem((pre) => ({
                      ...pre,
                      password: e.target.value,
                    }))
                  }
                  className="pl-11 h-12"
                  required
                />
              </div>
            </div>
            {isRegisterimg && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={item.confirm_password}
                    onChange={(e) =>
                      setItem((pre) => ({
                        ...pre,
                        confirm_password: e.target.value,
                      }))
                    }
                    className="pl-11 h-12"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {isRegisterimg ? "Register User" : "Sign in"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <span
              className={`pointer-cursor float-right ${isRegisterimg ? "border px-2 px-1" : ""}`}
              onClick={() => setIsRegisterimg(!isRegisterimg)}
            >
              {isRegisterimg
                ? "Login"
                : "I dont have an account click to Register"}
            </span>
          </form>
        </div>
      </div>
    </div>
  );
}
