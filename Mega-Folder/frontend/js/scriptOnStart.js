document.addEventListener('DOMContentLoaded', () => {
  window.authBootstrapPromise = (async () => {
  const pathname = window.location.pathname;
  const isLoginPage = pathname.includes('login.html');
  const isRegisterPage = pathname.includes('register.html');
  const isAuthPage = isLoginPage || isRegisterPage;
  const isProtectedPage =
    pathname.includes('cart.html') ||
    pathname.includes('checkout.html') ||
    pathname.includes('profile.html') ||
    pathname.includes('admin.html');
  const isAdminPage = pathname.includes('admin.html');

  const token = getAuthToken();

  if (!token) {
    clearAuthStorage();
    updateNavbar?.();
    bindLogoutButtons?.();
    hideLoading?.();

    if (isProtectedPage) {
      window.location.replace('login.html');
    }

    return;
  }

  if (isAuthPage) {
    try {
      const me = await API.getMe();
      setUser({ ...me, token });
      updateNavbar?.();
      bindLogoutButtons?.();
      window.location.replace('index.html');
    } catch (error) {
      clearAuthStorage();
      updateNavbar?.();
      bindLogoutButtons?.();
    } finally {
      hideLoading?.();
    }

    return;
  }

  try {
    const storedUser = getUser();
    if (!storedUser || !storedUser.username || !storedUser.email) {
      const me = await API.getMe();
      setUser({ ...(storedUser || {}), ...me, token });
    }

    const user = getUser();
    if (isAdminPage && user && !user.isAdmin) {
      clearAuthStorage();
      updateNavbar?.();
      bindLogoutButtons?.();
      hideLoading?.();
      window.location.replace('index.html');
      return;
    }
  } catch (error) {
    clearAuthStorage();
    updateNavbar?.();
    bindLogoutButtons?.();

    if (isProtectedPage || isAdminPage) {
      hideLoading?.();
      window.location.replace('login.html');
      return;
    }
  } finally {
    hideLoading?.();
  }

  updateNavbar?.();
  bindLogoutButtons?.();
  })();
});
