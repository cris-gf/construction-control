import { ArrowUpRight } from "lucide-react";
import { Brand } from "../../components/Brand";
import { appConfig } from "../../config/appConfig";
import { authText } from "../../locales/es/auth";
import { emulated } from "../../services/firebase";
import { useAuthForm } from "./useAuthForm";

export function Auth() {
  const {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    trusted,
    setTrusted,
    error,
    busy,
    submit,
  } = useAuthForm();
  return (
    <main className="auth">
      <div className="auth-story">
        <Brand />
        <h1>
          {authText.headlineStart}
          <br />
          {authText.headlineEnd}
        </h1>
        <p>
          {authText.introStart}
          <br />
          {authText.introEnd}
        </p>
        <div className="architectural">
          <div />
          <div />
          <div />
          <span>{authText.illustrationCaption}</span>
        </div>
      </div>
      <section className="auth-form">
        <span className="eyebrow">{authText.welcome}</span>
        <h2>
          {mode === "register"
            ? authText.registerTitle
            : mode === "reset"
              ? authText.resetTitle
              : authText.loginTitle}
        </h2>
        <p>{authText.subtitle}</p>
        <form onSubmit={submit}>
          <label>
            {authText.email}
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {mode !== "reset" && (
            <label>
              {authText.password}
              <input
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                minLength={appConfig.auth.minimumPasswordLength}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          <label className="check">
            <input
              type="checkbox"
              checked={trusted}
              onChange={(e) => setTrusted(e.target.checked)}
            />
            {authText.trustedDevice}
          </label>
          <small>{authText.trustedDeviceHint}</small>
          <button disabled={busy}>
            {busy
              ? authText.busy
              : mode === "login"
                ? authText.login
                : mode === "register"
                  ? authText.register
                  : authText.sendReset}
            <ArrowUpRight size={18} />
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
        <div className="auth-links">
          <button
            className="text-button"
            onClick={() => setMode(mode === "register" ? "login" : "register")}
          >
            {mode === "register"
              ? authText.haveAccount
              : authText.createAccount}
          </button>
          <button
            className="text-button"
            onClick={() => setMode(mode === "reset" ? "login" : "reset")}
          >
            {mode === "reset" ? authText.backToLogin : authText.forgotPassword}
          </button>
        </div>
        {emulated && <p className="demo-note">{authText.localEnvironment}</p>}
      </section>
    </main>
  );
}
