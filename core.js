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
    const keys_ = Object.keys(json_body.data)
    let array_ = ""
    for (var i = 0; i < keys_.length; i += 1) {
      array_ = array_+`
        <div class="col themed-grid-col">${json_body["hint"][keys_[i]]}</div>
        <div class="col themed-grid-col">${json_body["data"][keys_[i]]}</div>`
    }
    return array_
  }
  
  function update_data() {
    request_json(function(data) {
      document.title = `OkxGrid | ${data.data.float_profit}`
      document.getElementById(
        "data_body").innerHTML = build_table(data)
      document.getElementById(
        "last_update_stamp").innerHTML = new Date()
    })
  }
  
  function init() {
    update_data()
    setInterval(update_data, 800)
  }
  
  // start working
  init()
})
