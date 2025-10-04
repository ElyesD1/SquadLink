'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

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
              <AnimatedLogo size="lg" />
            </Link>

            <div className="space-y-4">
              <h1 className="text-5xl font-black leading-tight">
                Welcome <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Back!
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect with gamers who share your passion. Form squads, make friends, and elevate your gameplay.
              </p>
            </div>
          </div>

          {/* Supported Games */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground">Supported Games</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  name: 'League of Legends',
                  description: 'Find your perfect team composition',
                  gradient: 'from-blue-600 to-gold-400',
                  icon: '/league.png'
                },
                {
                  name: 'Valorant',
                  description: 'Tactical squad coordination',
                  gradient: 'from-red-500 to-orange-400',
                  icon: '/valorant.png'
                },
                {
                  name: 'Fortnite',
                  description: 'Build and battle together',
                  gradient: 'from-purple-500 to-pink-400',
                  icon: '/fortnite.png'
                }
              ].map((game, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="relative group"
                >
                  <div className={`h-24 rounded-2xl bg-gradient-to-br ${game.gradient} p-1`}>
                    <div className="h-full w-full bg-card/90 rounded-xl flex flex-col items-center justify-center gap-1 group-hover:bg-card/70 transition-colors">
                      <Image
                        src={game.icon}
                        alt={game.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-xs font-bold text-center leading-tight">{game.name}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Connect with players who share your gaming passion
            </p>
          </div>

          {/* Join the Community */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative overflow-hidden rounded-3xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5" />
            <div className="relative space-y-3">
              <div className="text-3xl">🎮</div>
              <h3 className="text-lg font-black text-foreground">Ready to Squad Up?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join fellow gamers, form lasting friendships, and dominate your favorite games together.
              </p>
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
                <Link href="/">
                  <AnimatedLogo size="md" />
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
