document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        console.log('in func js: login')
        alert('Login submitted (frontend only)');
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        console.log('in func js: register')
        alert('Registration submitted (frontend only)');
    });
  }

});
