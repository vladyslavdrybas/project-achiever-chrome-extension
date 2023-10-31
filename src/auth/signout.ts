const addLogoutEvent = () => {
  document.querySelector('#signout-btn')!.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      message: 'authentication_signout',
      function (response: any) {
        console.log(response);
        if (response.status === 200) {
          document.querySelector('#response')!.innerHTML = response.status.toString();
          window.location.replace('./signin.html');
        }
      }
    })
  });
}

document.addEventListener('DOMContentLoaded', function () {
  addLogoutEvent();
}, false)
