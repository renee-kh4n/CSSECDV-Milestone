document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();

      const formData = {
        email: loginForm.email.value,
        password: loginForm.password.value
      }

      const res = await fetch('/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log(formData);
      console.log('in func js: login')
      // alert('Login submitted (frontend only)');
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
        e.preventDefault();

        const formData = new FormData(registerForm);

        fetch('/register', {
        method: 'POST',
        body: formData
        });

        // const formData = {
        //     firstName: registerForm.firstName.value,
        //     lastName: registerForm.lastName.value,
        //     email: registerForm.email.value,
        //     phoneNumber: registerForm.phoneNumber.value,
        //     pfp: registerForm.pfp.value, // store in supabase bucket
        //     password: registerForm.password.value
        // }; 

        // const res = await fetch('/register', {
        //     method: 'POST',
        //     headers:{
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(formData)
        // });

        console.log('in func js: register');
        console.log(formData);
       // alert('Registration submitted (frontend only)');
    });
  }

});
