'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  Lock, 
  Zap, 
  AlertCircle, 
  ArrowRight, 
  Users, 
  Shield, 
  Gamepad2,
  Eye,
  EyeOff
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { storage } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(storage.getRememberMe());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        // Store remember me preference
        storage.setRememberMe(rememberMe);
        
        if (rememberMe) {
          // Store auto-login data for future sessions
          storage.setAutoLogin({
            email: formData.email,
            provider: 'credentials',
            lastLogin: new Date().toISOString()
          });
        } else {
          // Clear auto-login data if remember me is disabled
          storage.clearAutoLogin();
        }
        
        router.push('/home');
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Store remember me preference before Google OAuth
    storage.setRememberMe(rememberMe);
    
    if (rememberMe) {
      storage.setAutoLogin({
        provider: 'google',
        lastLogin: new Date().toISOString()
      });
    }
    
    signIn('google', { callbackUrl: '/home' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20" />
        
        {/* Floating Orbs */}
        <motion.div 
          className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding & Features */}
        <motion.div
          className="hidden lg:block space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo and Branding */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div 
                className="relative w-16 h-16 rounded-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 animate-gradient" />
                <div className="absolute inset-[2px] bg-background rounded-[14px] flex items-center justify-center">
                  <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="currentColor" />
                </div>
              </motion.div>
              <span className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                SquadLink
              </span>
            </Link>

            <div className="space-y-4">
              <h1 className="text-5xl font-black leading-tight">
                Welcome <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Back!
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Sign in to your account and continue your gaming journey with thousands of players worldwide.
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            {[
              { 
                icon: Users, 
                title: '50K+ Active Players',
                description: 'Join the largest gaming community'
              },
              { 
                icon: Shield, 
                title: 'Secure & Private',
                description: 'Your data is protected with enterprise-grade security'
              },
              { 
                icon: Gamepad2, 
                title: 'Multi-Game Support',
                description: 'Connect across 15+ popular games'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl border border-border/50 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Community Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative overflow-hidden rounded-3xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5" />
            <div className="relative space-y-4">
              <h3 className="text-lg font-black text-foreground">Live Community Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    2,341
                  </div>
                  <div className="text-sm text-muted-foreground">Players Online</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    156
                  </div>
                  <div className="text-sm text-muted-foreground">Active Squads</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1 pb-6">
              {/* Mobile Logo */}
              <div className="flex items-center justify-center lg:hidden mb-4">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    SquadLink
                  </span>
                </Link>
              </div>
              
              <CardTitle className="text-3xl font-black text-center">Sign In</CardTitle>
              <CardDescription className="text-center text-base">
                Welcome back! Enter your credentials to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full text-base font-semibold h-12 border-2 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300"
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="w-6 h-6" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground font-medium">Or continue with email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-12 border-2 focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Password</label>
                    <Link 
                      href="#" 
                      className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 pr-12 h-12 border-2 focus:border-purple-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Switch */}
                <div className="pt-2">
                  <Switch
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    label="Remember me"
                    description="Stay signed in for faster access"
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  variant="premium"
                  size="lg"
                  className="w-full text-base font-semibold h-12 shadow-lg shadow-purple-500/25"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-border/50">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                >
                  Create one now
                </Link>
              </p>
              <Link 
                href="/" 
                className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
