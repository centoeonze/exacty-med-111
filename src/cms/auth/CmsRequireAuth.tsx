import { ReactNode, useCallback, useEffect, useState } from "react";
import CmsLoginPage from "./CmsLoginPage";
import { fetchCmsSession, logoutCms } from "./cmsAuthApi";

type Props = {
  children: (helpers: { logout: () => Promise<void> }) => ReactNode;
};

const CmsRequireAuth = ({ children }: Props) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const refreshSession = useCallback(async () => {
    const session = await fetchCmsSession();
    setAuthenticated(session.authenticated);
    setChecking(false);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    await logoutCms();
    setAuthenticated(false);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0714] text-sm text-white/70">
        Verificando sessão…
      </div>
    );
  }

  if (!authenticated) {
    return <CmsLoginPage onSuccess={() => setAuthenticated(true)} />;
  }

  return <>{children({ logout })}</>;
};

export default CmsRequireAuth;
