import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import Image from 'next/image';
import { Avatar } from '@/components/ui/avatar';
import { Home, Settings, LogOut, Menu, Calendar, FileText, DollarSign, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import md5 from 'md5';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Sidebar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profile')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil:', error.message);
          return;
        }

        setAvatarUrl(data?.avatar_url || null);
        const name = data?.full_name || user?.email?.split('@')[0] || 'Usuário';
        const firstName = name.split(' ')[0];
        setFullName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      const emailHash = md5(user.email.trim().toLowerCase());
      const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
      setAvatarUrl((prev) => prev || gravatarUrl);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-primary bg-primary-foreground rounded-md"
      >
        <Menu />
      </Button>

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transform transition-transform fixed lg:static top-0 left-0 w-64 h-screen bg-primary-foreground text-primary p-4 flex flex-col justify-between z-50 shadow-lg`}
      >
        <div>
          <div className="flex flex-col items-center justify-center p-4">
            {avatarUrl ? (
              <Avatar className="w-16 h-16">
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  layout="fill"
                  className="rounded-full object-cover"
                  priority
                />
              </Avatar>
            ) : (
              <Avatar className="w-16 h-16 bg-primary-foreground flex items-center justify-center rounded-full">
                <span className="text-2xl text-primary">
                  {fullName?.charAt(0)}
                </span>
              </Avatar>
            )}
            <span className="mt-2 text-primary text-lg font-bold">{fullName}</span>
          </div>

          <Separator className="my-6 border-primary-foreground" />

          <nav className="mt-4">
            <ul>
              <li className="py-4 hover:bg-emerald-400 rounded">
                <Link href="/dashboard">
                  <Home className="inline mr-2" />
                  Dashboard
                </Link>
              </li>
              <li className="py-4 hover:bg-emerald-400 rounded">
                <Link href="/maintenance">
                  <Calendar className="inline mr-2" />
                  Manutenções
                </Link>
              </li>
              <li className="py-4 hover:bg-emerald-400 rounded">
                <Link href="/financeiro">
                  <DollarSign className="inline mr-2" />
                  Financeiro
                </Link>
              </li>
              <li className="py-4 hover:bg-emerald-400 rounded">
                <Link href="/cadastros">
                  <User className="inline mr-2" />
                  Cadastros
                </Link>
              </li>
              <li className="py-4 hover:bg-emerald-400 rounded">
                <Link href="/relatorios">
                  <FileText className="inline mr-2" />
                  Relatórios
                </Link>
              </li>
              <li className="py-4 hover:bg-emerald-400 rounded mt-auto">
                <Link href="/configuracoes">
                  <Settings className="inline mr-2" />
                  Configurações Gerais
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="py-2">
          <Button onClick={handleLogout} className="w-full text-left flex items-center text-primary bg-primary-foreground hover:bg-emerald-400">
            <LogOut className="inline mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 lg:hidden z-40 cursor-pointer pointer-events-auto"
        />
      )}
    </>
  );
};

export default Sidebar;
