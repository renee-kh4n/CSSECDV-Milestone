document.addEventListener('DOMContentLoaded', () => {

const phoneInput = document.getElementById('phoneNumber');

phoneInput.addEventListener('input', () => {
  let v = phoneInput.value;

  // Remove invalid characters
  v = v.replace(/[^\d+\s]/g, '');

  // Remove all spaces
  v = v.replace(/\s+/g, '');

  phoneInput.value = v; // allow backspace
});


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

      const data = await res.json();

      //console.log(data.success);

      if(data.success){ 
        if(data.role === 'admin')
          window.location.href = '/admin';
        else 
          window.location.href = '/admin';
      }else{ 
        //console.log("login error message");
        document.getElementById('error-login').textContent= "Invalid Credentials";
      }



    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
          e.preventDefault();

          const formData = new FormData(registerForm);

          console.log('in func js: register');
          console.log(formData);

          const countryCode = registerForm.countryCode.value;
          const number = registerForm.phoneNumber.value.replace(/\D/g, '');
          formData.set('phoneNumber', `${countryCode} ${number}`);
          formData.delete('countryCode');

          const res = await fetch('/register', {
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

         

        const data = await res.json();

        if(data.success){
          window.location.href = '/login';
        } else{
          document.getElementById('error-register').textContent= "User with email already exists!"; //does not work here
        }

    });
  }

});
