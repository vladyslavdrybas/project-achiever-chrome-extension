const addSignInSubmitEvent = () => {
  document.querySelector('form')!.addEventListener('submit', event => {
    event.preventDefault();

    const emailElem: any = document.querySelector('#email');
    const passwordElem: any = document.querySelector('#password');

    const email = emailElem && emailElem.value;
    const password = passwordElem && passwordElem.value;

    if (email && password) {
      chrome.runtime.sendMessage({
        message: 'email_password_authentication',
        payload: {email, password},
        function (response: any) {
          if (response === 'success') {
            document.querySelector('#response')!.innerHTML = response;
          }
        }
      })
    } else {
      emailElem.placeholder = "Enter an email.";
      passwordElem.placeholder = "Enter a password.";
    }
  });
}

addSignInSubmitEvent();

