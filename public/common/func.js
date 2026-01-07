document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('Login submitted (frontend only)');
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('Registration submitted (frontend only)');
    });
  }

});
