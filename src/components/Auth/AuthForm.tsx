import { useState } from 'react';
import { useAuth } from '../../auth/hook';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        if (await login(teamName, teamCode)) {
          setError('');
        } else {
          setError('Código incorrecto');
        }
      } else {
        if (email !== confirmEmail) {
          setError('Los emails no coinciden');
          return;
        }
        if (!email.includes('@')) {
          setError('Por favor, introduce un email válido');
          return;
        }
        if (await register(teamName, teamCode, email)) {
          setError('');
        } else {
          setError('Error al registrar el equipo. El nombre o email podría estar en uso.');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al procesar la solicitud');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Bienvenido a UnitGol</h2>
      <p className="text-gray-600 mb-8 text-center">
        {isLogin
          ? 'Por favor, introduce el nombre de tu equipo y el código de acceso para continuar.'
          : 'Registra tu equipo para comenzar.'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="teamName" className="block text-gray-700">
            Nombre del equipo
          </label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="p-3 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Mi equipo"
            required
          />
        </div>

        <div>
          <label htmlFor="teamCode" className="block text-gray-700">
            {isLogin ? 'Código de acceso' : 'Crear código de acceso'}
          </label>
          <input
            type="password"
            id="teamCode"
            value={teamCode}
            onChange={(e) => setTeamCode(e.target.value)}
            className="p-3 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="••••••••"
            required
          />
        </div>

        {!isLogin && (
          <>
            <div>
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="email@domain.com"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmEmail" className="block text-gray-700">
                Confirmar Email
              </label>
              <input
                type="email"
                id="confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="p-3 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="email@domain.com"
                required
              />
            </div>
          </>
        )}

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-colors"
        >
          {isLogin ? 'Acceder' : 'Registrar'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="w-full text-emerald-600 underline text-sm hover:text-emerald-700 transition-colors"
        >
          {isLogin ? '¿No tienes un equipo? Regístrate' : '¿Ya tienes un equipo? Inicia sesión'}
        </button>
      </form>
    </div>
  );
}
