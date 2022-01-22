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
      if ([
        "created_at_utc"
      ].indexOf(keys_[i]) > -1) {
        json_body["data"][keys_[i]] = new Date(json_body["data"][keys_[i]])
      }
      let name_ = `<div class="col themed-grid-col">${json_body["hint"][keys_[i]]}</div>`
      let varb_ = `<div class="col themed-grid-col">${json_body["data"][keys_[i]]}</div>`
      array_ = array_+name_+varb_
    }
    return array_
  }
  
  function update_data() {
    request_json(function(data) {
      document.title = `OkxGrid | ${data.data.float_profit}`
      document.getElementById(
        "data_body").innerHTML = build_table(data)
      document.getElementById(
        "last_update_stamp").innerHTML = new Date().toLocaleDateString("ua", {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
        hour: 'numeric', minute: 'numeric', second: 'numeric'
      })
    })
  }
  
  function init() {
    update_data()
    setInterval(update_data, 800)
  }
  
  // start working
  init()
})
