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
import { PasswordResetModal } from '@/components/ui/PasswordResetModal';

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
  const [showPasswordReset, setShowPasswordReset] = useState(false);

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
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
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
                Connect with gamers who share your passion. Form squads, make friends, and elevate your gameplay.
              </p>
            </div>
          </div>

          {/* Supported Games */}
          <div className="space-y-6">
            <h3 className="text-lg font-black font-mono uppercase tracking-wider text-cyan-400">Supported Games</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  name: 'League of Legends',
                  description: 'Find your perfect team composition',
                  gradient: 'from-cyan-400 to-blue-500',
                  icon: '/league.png'
                },
                {
                  name: 'Valorant',
                  description: 'Tactical squad coordination',
                  gradient: 'from-blue-500 to-cyan-400',
                  icon: '/valorant.png'
                },
                {
                  name: 'Fortnite',
                  description: 'Build and battle together',
                  gradient: 'from-cyan-500 to-blue-400',
                  icon: '/fortnite.png'
                }
              ].map((game, index) => (
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
                  
                  <div className={`relative h-24 bg-gradient-to-br ${game.gradient} p-[2px]`}
                    style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                  >
                    <div className="h-full w-full bg-[#0a1628] flex flex-col items-center justify-center gap-1 group-hover:bg-[#0a1628]/90 transition-all duration-300"
                      style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                    >
                      <Image
                        src={game.icon}
                        alt={game.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="text-xs font-bold font-mono text-center leading-tight text-cyan-400 group-hover:text-cyan-300 transition-colors">{game.name}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-gray-400 text-center">
              Connect with players who share your gaming passion
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
              <h3 className="text-lg font-black font-mono uppercase tracking-wider text-cyan-400">Ready to Squad Up?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
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
                Don't have an account?{' '}
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
