window.addEventListener("load", (function() {
    var currency_global = "uah", notify_hidden = true
    
    function price_dif(actual_price, buy_price) {
        return (((actual_price - buy_price) / buy_price) * 100).toFixed(3)
    }
    
    function notify(text) {
        const error_box = document.getElementById("error_box")
        const error_text = document.getElementById("error_text")

        if (notify_hidden) {
            notify_hidden = false
            error_text.innerText = text
            error_box.style["margin-bottom"] = "0"
            setTimeout(function() {
                error_box.style["margin-bottom"] = "-50px"
                notify_hidden = true
            }, 2500)
        }
    }

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ))
        return matches ? decodeURIComponent(matches[1]) : undefined
    }

    function setCookie(name, value, options = {}) {
        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString()
        }
      
        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value)
      
        for (let optionKey in options) {
            updatedCookie += "; " + optionKey
            let optionValue = options[optionKey]
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue
            }
        }
        document.cookie = updatedCookie
    }

    function currency_process(value, currency_srv) {
        if (value == 0) { value = value.toFixed(3) }
        if (currency_global == "usd") { return value }
        return (value * currency_srv[currency_global]).toFixed(3)
    }

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
        var array_ = "", currency_update = false
        // internal function
        function currency_calculate(keys_data, data, currency_srv) {
            for (var i = 0; i < keys_data.length; i += 1) {
                data[keys_data[i]] = currency_process(
                    data[keys_data[i]], currency_srv)
            }
            return data
        }
        for (var i = 0; i < keys_.length; i += 1) {
            if ([
            "created_at_utc"
            ].indexOf(keys_[i]) > -1) {
                json_body.data[keys_[i]] = get_time(
                new Date(json_body.data[keys_[i]]))
            }
            if ([
            "was_launched"
            ].indexOf(keys_[i]) > -1) {
                json_body.data[keys_[i]] = `${timeAgoConvert(json_body.data[keys_[i]])} тому`
            }
            if (!currency_update) {
                json_body.data = currency_calculate([
                    "annualized_rate", "profit", "current_price", "float_profit",
                    "total_price", "run-price"
                ], json_body.data, json_body.currency)
                currency_update = true
            }
            array_ = array_ + line_builder([
            json_body.hint[keys_[i]], json_body.data[keys_[i]]
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
            lines_[i]["profit"] = currency_process(
                lines_[i]["profit"], json_body.currency)
            if (lines_[i]["profit"] == 0) {
                lines_[i]["profit"] = "-"
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
        document.title = `OkxGrid | ${currency_process(
            data.data.float_profit, data.currency
        )} ${currency_global.toUpperCase()}`
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
        socket.on("message", (function(msg) {
            if (msg.data == "Connected" || msg.data == "I'm connected!") {
                return
            }
            update_data(msg)
        }))
    }
    
    function currency_change_notify() {
        notify(`Обрано валюту - ${currency_global.toUpperCase()}`)
    }

    function update_currency(button_id) {
        const currency = button_id.replace("currency_", "")
        if (currency.length) { 
            currency_global = currency
            setCookie("currency", currency)
            const all_buttons = document.getElementsByClassName('link_header_')
            for (var i = 0; i < all_buttons.length; i += 1) {
                document.getElementById(all_buttons[i].id).style.color = null
            }
            document.getElementById(button_id).style.color = "#fff"
            currency_change_notify()
        }
    }
    
    document.body.addEventListener('click', function(event) {
        update_currency(event.target.id)
    }, true)

    // start working
    function start_work() {
        const currency_cookie = getCookie("currency")
        if (currency_cookie) { currency_global = currency_cookie }
        update_currency(`currency_${currency_global}`)
        socket_()
    }
    setTimeout(start_work, 4000)
}))
