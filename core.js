window.addEventListener("load", function () {
  function get_time(time) {
    return time.toLocaleDateString("ua", {
      year: "numeric", month: "numeric",
      day: "numeric", hour: "numeric",
      minute: "numeric", second: "numeric"
    })
  }
  
  function build_table(json_body) {
    const keys_ = Object.keys(json_body.data)
    let array_ = ""
    for (var i = 0; i < keys_.length; i += 1) {
      let first_el_modify = ""
      if (i == 0) { first_el_modify = "style=\"border-top:0\"" }
      if ([
        "created_at_utc"
      ].indexOf(keys_[i]) > -1) {
        json_body["data"][keys_[i]] = get_time(
          new Date(json_body["data"][keys_[i]]))
      }
      const name_ = `<div class="col themed-grid-col" ${first_el_modify}>
        ${json_body["hint"][keys_[i]]}</div>`
      const varb_ = `<div class="col themed-grid-col" ${first_el_modify}>
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
  
  function update_data(data) {
    data = data.data
    document.title = `OkxGrid | ${data.data.float_profit}`
    document.getElementById(
      "data_body").innerHTML = build_table(data)
    document.getElementById(
      "trade_body").innerHTML = build_trades_table(data)
    document.getElementById(
      "last_update_stamp").innerHTML = get_time(new Date())
  }
  
  function socket_() {
    const socket = io.connect("https://okx-api.koval.page")
    socket.on("connect", function() {
      socket.emit("data_event", {data: "I'm connected!"});
    })
    socket.on("message", function(msg, cb) {
      console.log(msg)
      if (msg.data == "Connected" || msg.data == "I'm connected!") { return }
      update_data(msg)
    })
  }
  
  // start working
  socket_()
})
