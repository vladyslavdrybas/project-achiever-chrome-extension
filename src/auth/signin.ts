document.querySelector('form')!.addEventListener('submit', event => {
  event.preventDefault();

  const emailElem: any = document.querySelector('#email');
  const passwordElem: any = document.querySelector('#password');

  const email = emailElem && emailElem.value;
  const password = passwordElem && passwordElem.value;

  if (email && password) {
    chrome.runtime.sendMessage(
      {
        message: 'authentication_email_password',
        payload: {email, password}
      },
      function (response: BackgroundResponse) {
        console.log([
          'signin response',
          response?.status
        ]);
        if (response?.status === 200) {
          document.querySelector("#response")!.innerHTML = response.status.toString();
          document.location.replace('./signout.html');
        }
      }
    )
  } else {
    emailElem.placeholder = "Enter an email.";
    passwordElem.placeholder = "Enter a password.";
  }
});
