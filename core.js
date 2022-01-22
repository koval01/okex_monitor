window.addEventListener("load", function () {
  function request_json(callback, re_token) {
    const req = new XMLHttpRequest()
    req.responseType = "json"
    req.open(
      "POST", "https://okx-api.koval.page", true
    )
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    req.send(JSON.stringify({"re_token": re_token}))
    req.onload  = function() {
       const jsonResponse = req.response
       callback(jsonResponse)
    }
    req.send(null)
  }
  
  function get_time(time) {
    return time.toLocaleDateString("ua", {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    })
  }
  
  function build_table(json_body) {
    const keys_ = Object.keys(json_body.data)
    let array_ = ""
    for (var i = 0; i < keys_.length; i += 1) {
      if ([
        "created_at_utc"
      ].indexOf(keys_[i]) > -1) {
        json_body["data"][keys_[i]] = get_time(
          new Date(json_body["data"][keys_[i]]))
      }
      let name_ = `<div class="col themed-grid-col">
        ${json_body["hint"][keys_[i]]}</div>`
      let varb_ = `<div class="col themed-grid-col">
        ${json_body["data"][keys_[i]]}</div>`
      array_ = array_+name_+varb_
    }
    return array_
  }
  
  function build_trades_table(json_body) {
    const lines_ = json_body.trades
    let array_ = "", status_ = ""
    for (var i = 0; i < lines_.length; i += 1) {
      lines_[i]["trade_time"] = get_time(
        new Date(lines_[i]["trade_time"])
      )
      if (!lines_[i]["profit"] && !lines_[i]["profit_uah"]) {
        lines_[i]["profit"] = "-"
        lines_[i]["profit_uah"] = "-"
        status_ = `<div class="col themed-grid-col">Купівля</div>`
      } else {
        status_ = `<div class="col themed-grid-col">Продаж</div>`
      }
      let time_ = `<div class="col themed-grid-col">
        ${lines_[i]["trade_time"]}</div>`
      let profit_ = `<div class="col themed-grid-col">
        ${lines_[i]["profit"]}</div>`
      let profituah_ = `<div class="col themed-grid-col">
        ${lines_[i]["profit_uah"]}</div>`
      array_ = array_+time_+profit_+profituah_+status_
    }
    return array_
  }
  
  function update_data() {
    grecaptcha.ready(function () {
      grecaptcha.execute(
        "6LdJvy0eAAAAAAtszgbp8yj2beqgAV59w3JfZ08y", 
        {action: "submit"}).then(function (re_token) {
        request_json(function(data) {
          document.title = `OkxGrid | ${data.data.float_profit}`
          document.getElementById(
            "data_body").innerHTML = build_table(data)
          document.getElementById(
            "trade_body").innerHTML = build_trades_table(data)
          document.getElementById(
            "last_update_stamp").innerHTML = get_time(new Date())
        }, re_token)
      })
    })
  }
  
  function init() {
    update_data()
    setInterval(update_data, 1600)
  }
  
  // start working
  init()
})
