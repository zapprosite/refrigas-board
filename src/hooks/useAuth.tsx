import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'Admin' | 'Secretary' | 'Collaborator' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isApproved: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO: Set to false after migration and seed data are applied
const MOCK_MODE = false;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            if (MOCK_MODE) {
              setRole('Admin');
              setIsApproved(true);
              setLoading(false);
            } else {
              fetchUserRole(session.user.id);
            }
          }, 0);
        } else {
          setRole(null);
          setIsApproved(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (MOCK_MODE) {
          setRole('Admin');
          setIsApproved(true);
          setLoading(false);
        } else {
          fetchUserRole(session.user.id);
        }
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Fetch user role from user_roles table
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) throw roleError;

      // Fetch approval status from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('approved_at')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      setRole((userRole?.role as UserRole) || null);
      setIsApproved(!!profile?.approved_at);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
      setIsApproved(false);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setRole(null);
      setIsApproved(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao sair',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, isApproved, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
