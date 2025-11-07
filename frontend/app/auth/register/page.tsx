'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker-futuristic';
import { MinorProtectionPopup } from '@/components/ui/minor-protection-popup';
import { 
  User, 
  Mail, 
  Lock, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Users,
  Shield,
  Gamepad2,
  Sparkles,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { API_URL } from '@/lib/constants';
import { differenceInYears, startOfDay } from 'date-fns';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: undefined as Date | undefined,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMinorPopup, setShowMinorPopup] = useState(false);

  const getAge = (birthDate: Date) => {
    return differenceInYears(startOfDay(new Date()), startOfDay(birthDate));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate birth date
    if (!formData.birthDate) {
      setError('Please select your birth date');
      return;
    }

    const age = getAge(formData.birthDate);
    
    if (age < 13) {
      setError('You must be at least 13 years old to register');
      return;
    }
    
    if (age > 120) {
      setError('Please enter a valid birth date');
      return;
    }

    // Show minor protection popup if user is under 18
    if (age < 18) {
      setShowMinorPopup(true);
      return;
    }

    // If 18 or older, proceed with registration
    await submitRegistration(age);
  };

  const submitRegistration = async (age: number) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          age: age
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
      
      // Auto sign in after registration
      setTimeout(async () => {
        await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });
        router.push('/home');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMinorConfirm = () => {
    const age = getAge(formData.birthDate!);
    setShowMinorPopup(false);
    submitRegistration(age);
  };

  const handleMinorCancel = () => {
    setShowMinorPopup(false);
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/home' });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-black">Welcome to SquadLink!</h2>
          <p className="text-muted-foreground">Redirecting you to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#050a15] to-[#0f1f3a]">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid Pattern */}
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
        {/* Left Side - Branding */}
        <motion.div
          className="hidden lg:block space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <AnimatedLogo size="lg" variant="futuristic" />
            </Link>

            <div className="space-y-4">
              <h1 className="text-5xl font-black font-mono leading-tight uppercase tracking-wider">
                Join the <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                  Squad!
                </span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Join League of Legends players worldwide. Find your perfect team and climb the ranks together.
              </p>
            </div>

            {/* League Features */}
            <div className="space-y-6">
              <h3 className="text-lg font-black font-mono uppercase tracking-wider text-cyan-400">What You Get</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { 
                    icon: Users, 
                    name: 'Find Your Team',
                    description: 'Match by role, rank, and playstyle',
                    gradient: 'from-cyan-400 to-blue-500'
                  },
                  { 
                    icon: Target, 
                    name: 'Ranked Squads',
                    description: 'Climb the ladder with teammates',
                    gradient: 'from-blue-500 to-cyan-400'
                  },
                  { 
                    icon: BarChart3, 
                    name: 'Track Performance',
                    description: 'Stats, match history & analytics',
                    gradient: 'from-cyan-500 to-blue-400'
                  }
                ].map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="relative flex items-center gap-4 p-3 border-2 border-cyan-400/30 bg-[#0a1628] hover:bg-[#0a1628]/90 transition-all duration-300 group cursor-pointer"
                      style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className={`relative w-12 h-12 bg-gradient-to-br ${feature.gradient} flex items-center justify-center p-1`}
                        style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                      >
                        <IconComponent className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="relative space-y-1">
                        <span className="text-cyan-400 font-bold font-mono group-hover:text-cyan-300 transition-colors">{feature.name}</span>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Gaming Community Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="relative overflow-hidden border-2 border-cyan-400/30 p-6 backdrop-blur-sm"
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
              
              <div className="relative text-center space-y-6 z-10">
                <div className="flex justify-center items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center p-2"
                    style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                  >
                    <Users className="w-12 h-12 text-black" />
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center p-2"
                    style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                  >
                    <Gamepad2 className="w-12 h-12 text-black" />
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center p-2"
                    style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                  >
                    <Shield className="w-12 h-12 text-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black font-mono uppercase tracking-wider text-cyan-400">Ready to Dominate the Rift?</h3>
                  <p className="text-sm text-gray-400">
                    Join thousands of League of Legends players building their dream teams
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Register Form */}
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
              <div className="flex items-center justify-center lg:hidden mb-4">
                <Link href="/">
                  <AnimatedLogo size="md" variant="futuristic" />
                </Link>
              </div>
              <CardTitle className="text-3xl font-black font-mono uppercase tracking-wider text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">Create Account</CardTitle>
              <CardDescription className="text-center text-base text-gray-400">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 border-2 border-red-500/30 bg-red-500/10 text-red-400"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold font-mono uppercase tracking-wider text-cyan-400">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                      <Input
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-12 h-12 border-2 border-cyan-400/30 bg-[#0f1f3a]/50 text-gray-100 placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                        style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold font-mono uppercase tracking-wider text-cyan-400">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                      <Input
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="pl-12 h-12 border-2 border-cyan-400/30 bg-[#0f1f3a]/50 text-gray-100 placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                        style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold font-mono uppercase tracking-wider text-cyan-400">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-12 border-2 border-cyan-400/30 bg-[#0f1f3a]/50 text-gray-100 placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                      style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold font-mono uppercase tracking-wider text-cyan-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 h-12 border-2 border-cyan-400/30 bg-[#0f1f3a]/50 text-gray-100 placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                      style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold font-mono uppercase tracking-wider text-cyan-400">Birth Date</label>
                  <DatePicker
                    value={formData.birthDate}
                    onChange={(date) => setFormData({ ...formData, birthDate: date })}
                    placeholder="Select your birth date"
                  />
                  <p className="text-xs text-gray-500">
                    {formData.birthDate && `Age: ${getAge(formData.birthDate)}`}
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="relative w-full text-base font-bold font-mono uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 hover:from-cyan-300 hover:via-blue-400 hover:to-cyan-300 text-[#0a1628] transition-all duration-300 overflow-hidden group"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                  disabled={loading}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <span className="relative">Create Account →</span>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0a1628] text-gray-400 font-mono uppercase tracking-wider">Or sign up with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full text-base font-semibold border-2 border-cyan-400/30 bg-transparent hover:bg-cyan-400/10 hover:border-cyan-400/50 text-gray-100"
                style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="w-6 h-6" />
                Google
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-cyan-400/20">
              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                  Sign in
                </Link>
              </p>
              <Link href="/" className="text-center text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                ← Back to home
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Minor Protection Popup */}
      <MinorProtectionPopup
        isOpen={showMinorPopup}
        onClose={handleMinorCancel}
        onConfirm={handleMinorConfirm}
        onCancel={handleMinorCancel}
      />
    </div>
  );
}
