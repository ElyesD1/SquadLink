'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { MinorProtectionPopup } from '@/components/ui/minor-protection-popup';
import { 
  User, 
  Mail, 
  Lock, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Users,
  ArrowRight,
  Shield,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { differenceInYears, startOfDay } from 'date-fns';

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
      const response = await fetch('http://localhost:3001/auth/register', {
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10 dark:from-purple-900/20 dark:via-background dark:to-blue-900/20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MzM1ZWEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzR6bTAtNHYyaDJ2LTJ6bS0yIDJoLTJ2Mmgydi0yem0yLTJoMnYtMmgtMnYyem0tMiAwdi0yaC0ydjJoMnptMi00djJoMnYtMmgtMnptLTQgMHYyaDJ2LTJoLTJ6bS0yIDJ2LTJoLTJ2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                SquadLink
              </span>
            </Link>

            <div className="space-y-4">
              <h1 className="text-5xl font-black leading-tight">
                Join the <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Squad!
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Create your account and start connecting with gamers around the world. Your adventure begins now.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mt-8">
              {[
                { icon: Users, text: 'Connect with 50K+ gamers worldwide' },
                { icon: Zap, text: 'Real-time squad matchmaking' },
                { icon: CheckCircle, text: 'Free forever, no credit card required' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-foreground font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Gaming Image */}
            <div className="relative mt-12">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-3xl blur-3xl opacity-20" />
              <img
                src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80"
                alt="Gaming"
                className="relative rounded-2xl shadow-2xl border-2 border-purple-500/20"
              />
            </div>
          </div>
        </motion.div>

        {/* Right Side - Register Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-2 border-border shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
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
              <CardTitle className="text-3xl font-black text-center">Create Account</CardTitle>
              <CardDescription className="text-center text-base">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-12 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="pl-12 h-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 h-12"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Birth Date</label>
                  <DatePicker
                    value={formData.birthDate}
                    onChange={(date) => setFormData({ ...formData, birthDate: date })}
                    placeholder="Select your birth date"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.birthDate && `Age: ${getAge(formData.birthDate)}`}
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="premium"
                  size="lg"
                  className="w-full text-base font-semibold"
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
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground font-medium">Or sign up with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full text-base font-semibold"
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="w-6 h-6" />
                Google
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                  Sign in
                </Link>
              </p>
              <Link href="/" className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
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
