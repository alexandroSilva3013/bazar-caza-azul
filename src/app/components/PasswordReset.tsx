import { useState } from 'react';
const API = import.meta.env.VITE_API_URL || '';

export function AdminPasswordReset({ id }: { id: number }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function reset() {
    if (busy || !window.confirm('Redefinir a senha deste usuário? A senha anterior e suas sessões deixarão de funcionar.')) return;
    setBusy(true); setError(''); setPassword('');
    try {
      const response = await fetch(`${API}/api/usuarios/${id}/redefinir-senha`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }, body: '{}' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Não foi possível redefinir.');
      setPassword(data.senha_temporaria);
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha de conexão.'); }
    finally { setBusy(false); }
  }
  return <section className="border-t pt-4">
    <button type="button" disabled={busy} onClick={reset} className="text-primary font-semibold disabled:opacity-50">{busy ? 'Gerando...' : 'Redefinir senha'}</button>
    {password && <div className="mt-3 rounded-lg bg-accent p-3"><p>Senha temporária (anote antes de fechar):</p><code className="select-all font-bold break-all">{password}</code><p className="text-sm mt-2">Entregue diretamente ao titular após confirmar sua identidade. Ele precisará escolher outra senha ao entrar.</p></div>}
    {error && <p role="alert" className="text-red-600">{error}</p>}
  </section>;
}

export function RequiredPasswordChange({ onExit }: { onExit: () => void }) {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (busy) return;
    if (password !== confirm) { setError('As novas senhas não coincidem.'); return; }
    setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/api/usuarios/minha-senha`, {method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${localStorage.getItem('token')}`},body:JSON.stringify({senha_atual:current,nova_senha:password})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Não foi possível alterar.');
      localStorage.removeItem('token'); setDone(true); setCurrent(''); setPassword(''); setConfirm('');
    } catch(e) { setError(e instanceof Error ? e.message : 'Falha de conexão.'); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-accent flex items-center justify-center p-4"><div className="bg-white rounded-xl p-6 w-full max-w-md">
    <h1 className="text-2xl font-bold mb-4">{done ? 'Senha alterada' : 'Defina sua nova senha'}</h1>
    {done ? <p>Entre novamente usando sua nova senha.</p> : <form onSubmit={save} className="space-y-4">
      <p>Seu acesso usa uma senha temporária. Escolha uma senha pessoal para continuar.</p>
      <label className="block">Senha temporária<input type="password" autoComplete="current-password" required value={current} onChange={e=>setCurrent(e.target.value)} className="block w-full border p-3 rounded-lg" /></label>
      <label className="block">Nova senha<input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} className="block w-full border p-3 rounded-lg" /></label>
      <label className="block">Confirmar nova senha<input type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} className="block w-full border p-3 rounded-lg" /></label>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <button disabled={busy} className="bg-primary text-white rounded-lg p-3 w-full disabled:opacity-50">{busy ? 'Salvando...' : 'Salvar nova senha'}</button>
    </form>}
    <button disabled={busy} onClick={onExit} className="text-primary mt-4">{done ? 'Ir para o login' : 'Sair'}</button>
  </div></main>;
}
