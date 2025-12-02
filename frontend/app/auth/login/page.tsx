'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  CheckCircle,
  ArrowRight, 
  Users, 
  Shield, 
  Gamepad2,
  Eye,
  EyeOff,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { storage } from '@/lib/storage';
import { completeAuthReset } from '@/lib/auth-utils';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { PasswordResetModal } from '@/components/ui/PasswordResetModal';

// Pre-defined particle positions to avoid hydration mismatch
const PARTICLE_POSITIONS = [
  { left: 15, top: 25 },
  { left: 85, top: 15 },
  { left: 45, top: 65 },
  { left: 70, top: 40 },
  { left: 30, top: 80 },
  { left: 90, top: 55 },
  { left: 10, top: 45 },
  { left: 55, top: 20 },
  { left: 25, top: 90 },
  { left: 80, top: 70 },
  { left: 60, top: 35 },
  { left: 40, top: 75 },
  { left: 20, top: 60 },
  { left: 75, top: 85 },
  { left: 50, top: 50 },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(storage.getRememberMe());
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Check if user just registered
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Account created successfully! Please login with your credentials.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // CRITICAL: Complete auth reset before login
      completeAuthReset();
      
      // Sign out first to clear any existing session
      await signOut({ redirect: false });
      
      // Small delay to ensure session is cleared
      await new Promise(resolve => setTimeout(resolve, 200));
      
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
        }
        
        // Force page reload to ensure clean session
        window.location.href = '/profile';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Complete auth reset before Google OAuth
    completeAuthReset();
    
    // Store remember me preference before Google OAuth
    storage.setRememberMe(rememberMe);
    
    if (rememberMe) {
      storage.setAutoLogin({
        provider: 'google',
        lastLogin: new Date().toISOString()
      });
    }
    
    signIn('google', { callbackUrl: '/profile' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#050a15] to-[#0f1f3a]">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid Pattern - Behind everything */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Floating Orbs */}
        <motion.div 
          className="absolute top-20 -left-20 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -80, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Scan lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,255,255,0.03)_50%,transparent_100%)] bg-[length:100%_4px]" />
        
        {/* Floating Particles */}
        {PARTICLE_POSITIONS.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        
        {/* Tech Lines */}
        <motion.div
          className="absolute top-1/4 left-0 w-64 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
          animate={{ x: [-100, 1000] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-0 w-96 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
          animate={{ x: [1000, -100] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
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
              <AnimatedLogo size="lg" variant="futuristic" />
            </Link>

            <div className="space-y-4">
              <h1 className="text-5xl font-black font-mono leading-tight uppercase tracking-wider">
                Welcome <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                  Back!
                </span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Join League of Legends players worldwide. Find your perfect team, climb the ranks, and dominate the rift.
              </p>
            </div>
          </div>

          {/* League Features */}
          <div className="space-y-6">
            <h3 className="text-lg font-black font-mono uppercase tracking-wider text-cyan-400">League of Legends</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  name: 'Find Teams',
                  description: 'Match by role and rank',
                  gradient: 'from-cyan-400 to-blue-500',
                  icon: Users
                },
                {
                  name: 'Ranked Squads',
                  description: 'Climb the ladder together',
                  gradient: 'from-blue-500 to-cyan-400',
                  icon: Target
                },
                {
                  name: 'Track Stats',
                  description: 'View performance metrics',
                  gradient: 'from-cyan-500 to-blue-400',
                  icon: BarChart3
                }
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative group cursor-pointer"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className={`relative h-24 bg-gradient-to-br ${feature.gradient} p-[2px]`}
                      style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                    >
                      <div className="h-full w-full bg-[#0a1628] flex flex-col items-center justify-center gap-1 group-hover:bg-[#0a1628]/90 transition-all duration-300"
                        style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                      >
                        <IconComponent className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs font-bold font-mono text-center leading-tight text-cyan-400 group-hover:text-cyan-300 transition-colors">{feature.name}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-sm text-gray-400 text-center">
              Connect with players who share your LoL passion
            </p>
          </div>

          {/* Join the Community */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
            }}
            transition={{ delay: 0.7 }}
            className="relative overflow-hidden border-2 border-cyan-400/30 p-6 text-center group cursor-pointer"
            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
          >
            {/* Solid background to hide grid */}
            <div className="absolute inset-0 bg-[#0a1628]/95 backdrop-blur-sm" />
            
            {/* Animated gradient overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            {/* Corner brackets with glow */}
            <motion.div 
              className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            />
            
            <div className="relative space-y-3 z-10">
              <motion.div 
                className="text-3xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎮
              </motion.div>
              <h3 className="text-lg font-black font-mono uppercase tracking-wider text-cyan-400">Ready to Climb?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Join League of Legends players, build your dream team, and dominate the rift together.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto relative"
        >
          {/* Pulsing glow behind card */}
          <motion.div
            className="absolute inset-0 bg-cyan-400/10 blur-3xl rounded-lg"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <Card className="relative border-2 border-cyan-400/30 shadow-[0_0_50px_rgba(0,255,255,0.15)] backdrop-blur-sm bg-gradient-to-br from-[#0a1628]/95 to-[#0f1f3a]/95"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            {/* Corner brackets with animation */}
            <motion.div 
              className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 z-10"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 z-10"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 z-10"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 z-10"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            />
            
            <CardHeader className="space-y-1 pb-6">
              {/* Mobile Logo */}
              <div className="flex items-center justify-center lg:hidden mb-4">
                <Link href="/">
                  <AnimatedLogo size="md" variant="futuristic" />
                </Link>
              </div>
              
              <CardTitle className="text-3xl font-black font-mono text-center uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">Sign In</CardTitle>
              <CardDescription className="text-center text-base text-gray-400">
                Welcome back! Enter your credentials to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 text-red-400"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{success}</p>
                </motion.div>
              )}

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full text-base font-semibold h-12 border-2 border-cyan-400/30 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-300 text-gray-300"
                style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="w-6 h-6" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0a1628] text-gray-400 font-medium font-mono uppercase tracking-wider">Or continue with email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold font-mono uppercase tracking-wider text-cyan-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-12 border-2 border-cyan-400/30 bg-[#0f1f3a]/50 text-gray-200 focus:border-cyan-400 transition-colors"
                      style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold font-mono uppercase tracking-wider text-cyan-400">Password</label>
                    <Link 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPasswordReset(true);
                      }}
                      className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 pr-12 h-12 border-2 border-cyan-400/30 bg-[#0f1f3a]/50 text-gray-200 focus:border-cyan-400 transition-colors"
                      style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
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
                  size="lg"
                  className="w-full text-base font-mono font-semibold h-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all duration-300 uppercase tracking-wider text-black border-0"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Zap className="w-5 h-5 text-black" />
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

            <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-cyan-400/20">
              <p className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Create one now
                </Link>
              </p>
              <Link 
                href="/" 
                className="text-center text-sm text-gray-400 hover:text-cyan-400 transition-colors"
              >
                ← Back to home
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />
    </div>
  );
}
