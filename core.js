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
  
  function build_table(json_body) {
    return
  }
  
  function update_data() {
    request_json(function(data) {
      document.title = `OkxGrid | ${data.data.float_profit}`
//       document.getElementById(
//         "body_json").innerHTML = JSON.stringify(data, null, 5)
    })
  }
  
  function init() {
    update_data()
    setInterval(update_data, 1000)
  }
  
  // start working
  init()
})
