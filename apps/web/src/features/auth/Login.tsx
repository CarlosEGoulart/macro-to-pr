/**
 * Tela de login mínima.
 *
 * Destino do redirecionamento disparado pela camada de serviço quando a API
 * responde 401 (token expirado/revogado). O acesso em si é feito via OAuth
 * GitHub (fora de escopo desta tarefa), então esta tela apenas comunica a
 * expiração e aponta para o ponto de entrada do OAuth.
 */
export function Login() {
  return (
    <section id="login" aria-label="Login">
      <h1>Login</h1>
      <p>Sessão expirada. Faça login novamente com o GitHub para continuar.</p>
      <a href="/auth/github">Entrar com GitHub</a>
    </section>
  );
}
