window.addEventListener("load", function () {
  function request_json(callback) {
    const req = new XMLHttpRequest();
    req.responseType = "json"
    req.open(
      "GET", "https://okx-api.koval.page", true
    )
    req.onload  = function() {
       const jsonResponse = req.response
       callback(jsonResponse)
    };
    req.send(null)
  }
  
  function update_pre() {
    request_json(function(data) {
      document.getElementById(
        "body_json").innerHTML = JSON.stringify(data)
    })
  }
  
  function init() {
    update_pre()
    setInterval(update_pre, 1000)
  }
  
  // start working
  init()
})
