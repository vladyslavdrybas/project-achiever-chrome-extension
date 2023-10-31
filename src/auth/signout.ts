const addLogoutEvent = () => {
  document.querySelector('#signout-btn')!.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      message: 'authentication_signout',
      function (response: any) {
        console.log(response);
        alert(response);
        if (response.status === 200) {
          document.querySelector('#response')!.innerHTML = response.status.toString();
          window.location.replace('./popup_signin.html');
        }
      }
    })
  });
}

addLogoutEvent();

