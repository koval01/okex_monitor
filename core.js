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
        json_body["data"][keys_[i]] = new Date(json_body["data"][keys_[i]]).toLocaleDateString("ua", {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
          hour: 'numeric', minute: 'numeric', second: 'numeric'
        })
      }
      let name_ = `<div class="col themed-grid-col">${json_body["hint"][keys_[i]]}</div>`
      let varb_ = `<div class="col themed-grid-col">${json_body["data"][keys_[i]]}</div>`
      array_ = array_+name_+varb_
    }
    return array_
  }
  
  function build_trades_table(json_body) {
    const lines_ = json_body.trades
    let array_ = "", status_ = ""
    for (var i = 0; i < lines_.length; i += 1) {
      if (!lines_[i]["profit"] && !lines_[i]["profit_uah"]) {
        lines_[i]["profit"] = "-"
        lines_[i]["profit_uah"] = "-"
        status_ = `<div class="col themed-grid-col">Купівля</div>`
      } else {
        status_ = `<div class="col themed-grid-col">Продаж</div>`
      }
      let id_ = `<div class="col themed-grid-col">${lines_[i]["trade_id"]}</div>`
      let time_ = `<div class="col themed-grid-col">${lines_[i]["trade_time"]}</div>`
      let profit_ = `<div class="col themed-grid-col">${lines_[i]["profit"]}</div>`
      let profituah_ = `<div class="col themed-grid-col">${lines_[i]["profit_uah"]}</div>`
      array_ = array_+id_+time_+profit_+profituah_+status_
    }
    return array_
  }
  
  function update_data() {
    request_json(function(data) {
      document.title = `OkxGrid | ${data.data.float_profit}`
      document.getElementById(
        "data_body").innerHTML = build_table(data)
      document.getElementById(
        "trade_body").innerHTML = build_trades_table(data)
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
