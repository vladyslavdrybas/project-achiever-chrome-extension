document.querySelector('#signout-btn')!.addEventListener('click', () => {
  chrome.runtime.sendMessage({
      message: 'authentication_signout',
    },
    function (response: BackgroundResponse)
    {
      console.log([
        'signout response',
        response?.status
      ]);
      if (response?.status === 200) {
        document.querySelector("#response")!.innerHTML = response.status.toString();
        document.location.replace('./signin.html');
      }
    }
  )
});
