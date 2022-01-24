window.addEventListener("load", (function() {
    function timeAgoConvert(date) {
        const seconds = Math.floor((new Date() - date) / 1000)
        const interval = seconds / 31536000
        // internal function
        function builder(data, interval) {
            if (interval > 1) {
                const time_ = Math.floor(interval)
                function sstr(data, val) { return parseInt(data.toString().substr(val)) }
                let one_l = sstr(time_, -1), two_l = sstr(time_, -2)

                if ((one_l === 1 && two_l < 11) || (two_l > 20 && one_l === 1)) {
                    return data[0]
                } else if ((two_l > 20 && one_l > 1 && one_l < 5) || (5 > one_l && one_l > 1 && two_l < 11)) {
                    return time_ + ` ${data[1]}`
                } else { return time_ + ` ${data[2]}` }
            }
        }
        const data = [
            {interval: interval, pattern: [
                "рік", "роки", "років"
            ]},
            {interval: seconds / 2592000, pattern: [
                "місяць", "місяці", "місяців"
            ]},
            {interval: seconds / 86400, pattern: [
                "день", "дні", "днів"
            ]},
            {interval: seconds / 3600, pattern: [
                "годину", "години", "годин"
            ]},
            {interval: seconds / 60, pattern: [
                "хвилину", "хвилини", "хвилин"
            ]}
        ]
        for (var i = 0; i < data.length; i += 1) {
            const resp = builder(data[i].pattern, data[i].interval)
            if (resp) { return resp }
        }
    }

    function get_time(time) {
        return time.toLocaleDateString("ua", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
        })
    }

    function line_builder(data, not_first=false) {
        var result = ""
        for (var i = 0; i < data.length; i += 1) {
            let first_el_modify = ""
            if (not_first) {
                first_el_modify = "style=\"border-top:0\""
            }
            result = result + `<div class="col themed-grid-col" 
      ${first_el_modify}>${data[i]}</div>`
        }
        return result
    }

    function build_table(json_body) {
        const keys_ = Object.keys(json_body.data)
        var array_ = ""
        for (var i = 0; i < keys_.length; i += 1) {
            if ([
            "created_at_utc"
            ].indexOf(keys_[i]) > -1) {
                json_body["data"][keys_[i]] = get_time(
                new Date(json_body["data"][keys_[i]]))
            }
            if ([
            "was_launched"
            ].indexOf(keys_[i]) > -1) {
                json_body["data"][keys_[i]] = `${timeAgoConvert(json_body["data"][keys_[i]])} тому`
            }
            array_ = array_ + line_builder([
            json_body["hint"][keys_[i]], json_body["data"][keys_[i]]
            ], !i)
        }
        return array_
    }

    function build_trades_table(json_body) {
        const lines_ = json_body.trades
        let array_ = "",
            status_ = ""
        for (var i = 0; i < lines_.length; i += 1) {
            lines_[i]["trade_time"] = get_time(
            new Date(lines_[i]["trade_time"])
            )
            if (!lines_[i]["profit"] && !lines_[i]["profit_uah"]) {
                lines_[i]["profit"] = "-"
                lines_[i]["profit_uah"] = "-"
                status_ = "Купівля"
            } else {
                status_ = "Продаж"
            }
            array_ = array_ + line_builder([
            lines_[i]["trade_time"], lines_[i]["profit"], status_
            ], !i)
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
        socket.on("connect", (function() {
            socket.emit("data_event", {
                data: "I'm connected!"
            })
        }))
        socket.on("message", (function(msg, cb) {
            console.log(msg)
            if (msg.data == "Connected" || msg.data == "I'm connected!") {
                return
            }
            update_data(msg)
        }))
    }
    
    document.body.click(function(event) {
        console.log(event)
        let obj_id = event.target.id
        let currency = obj_id.replace("currency_", "")
        if (currency.length) { console.log(currency) }
    })

    // start working
    socket_()
}))

