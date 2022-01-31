var currency_global = "uah",
    lang_loc = "uk",
    selected_spot_global = 0
window.addEventListener("load", (function () {
    var notify_hidden = true,
        lang_patterns = {},
        price_chart = null,
        last_profit_stamp = 0
    const api_host = "https://okx-api.koval.page"
    function getOnlyTime(unix_time) {
        function timeFix(i) {
            if (i < 10) {
                i = "0" + i
            }
            return i
        }
        const time_ = new Date(unix_time)
        return `${timeFix(time_.getHours())}:${timeFix(time_.getMinutes())}`
    }
    function price_chart_init() {
        const data = {
            labels: null,
            datasets: [{
                label: "USD",
                backgroundColor: "rgb(255, 255, 255, 0.2)",
                borderColor: "rgb(229, 229, 234)",
                data: null,
                tension: 0.4,
                borderWidth: 2,
                radius: 0,
                fill: {
                    target: true,
                    above: "rgb(255, 255, 255, 0.2)",
                    below: "rgb(255, 255, 255, 0.2)"
                }
            }]
        }
        const config = {
            type: "line",
            data: data,
            options: {
                scales: {
                    x: {
                        ticks: {
                            callback: function (val, index) {
                                return index % 4 === 0 ? this.getLabelForValue(val) : ''
                            },
                            maxRotation: 0,
                            minRotation: 0
                        },
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    },
                    y: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        position: "nearest"
                    }
                }
            }
        }
        price_chart = new Chart(document.getElementById("price_chart"), config)
    }
    function price_chart_update(value, time) {
        const data = price_chart.data
        var labels_ = data.labels
        if (data.datasets.length > 0) {
            if (!labels_) {
                labels_ = [getOnlyTime(time)]
            } else {
                labels_ = labels_.push(getOnlyTime(time))
            }
            for (let i = 0; i < data.datasets.length; ++i) {
                data.datasets[i].data.push(value)
            }
            price_chart.update()
        }
    }
    function data_price_chart() {
        request(`${api_host}/profit?index=${selected_spot_global}`, function (data_) {
            const data = data_.data.reverse()
            if (last_profit_stamp == 0) {
                document.getElementById("price_chart_container").style.display = null
            }
            for (let i = 0; i < data.length; i++) {
                if (data[i].time > last_profit_stamp) {
                    price_chart_update(data[i].position, data[i].time)
                    last_profit_stamp = data[i].time
                }
            }
        })
    }
    function request(url, callback) {
        var req = new XMLHttpRequest()
        req.responseType = "json"
        req.open("GET", url, true)
        req.onload = function () {
            callback(JSON.parse(JSON.stringify(req.response)))
        }
        req.send(null)
    }
    function getJson(file, callback) {
        request(`${window.location.origin}/${file}`, function (data) {
            callback(data)
        })
    }
    function price_dif(actual_price, buy_price) {
        let result = (((actual_price - buy_price) / buy_price) * 100).toFixed(3)
        if (result > 0) {
            `+${result}`
        }
        return result.toString()
    }
    function notify(text) {
        const error_box = document.getElementById("error_box")
        const error_text = document.getElementById("error_text")
        if (notify_hidden) {
            notify_hidden = false
            error_text.innerText = text
            error_box.style["margin-bottom"] = "0"
            setTimeout(function () {
                error_box.style["margin-bottom"] = "-150px"
                notify_hidden = true
            }, 2500)
        }
    }
    function getCookie(name) {
        let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"))
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
        if (value == 0) {
            value = value.toFixed(3)
        }
        if (currency_global == "usd") {
            return value
        }
        return (value * currency_srv[currency_global]).toFixed(3)
    }
    function timeAgoConvert(date) {
        const seconds = Math.floor((new Date() - date) / 1000)
        const interval = seconds / 31536000
        function builder(data, interval) {
            if (interval > 1) {
                const time_ = Math.floor(interval)
                function sstr(data, val) {
                    return parseInt(data.toString().substr(val))
                }
                let one_l = sstr(time_, -1),
                    two_l = sstr(time_, -2)
                if ((one_l === 1 && two_l < 11) || (two_l > 20 && one_l === 1)) {
                    return data[0]
                } else if ((two_l > 20 && one_l > 1 && one_l < 5) || (5 > one_l && one_l > 1 && two_l < 11)) {
                    return time_ + ` ${data[1]}`
                } else {
                    return time_ + ` ${data[2]}`
                }
            }
        }
        const localization_ = lang_patterns[lang_loc]["time_converter_patterns"]
        const data = [{
            interval: interval,
            pattern: localization_["year"]
        }, {
            interval: seconds / 2592000,
            pattern: localization_["month"]
        }, {
            interval: seconds / 86400,
            pattern: localization_["day"]
        }, {
            interval: seconds / 3600,
            pattern: localization_["hour"]
        }, {
            interval: seconds / 60,
            pattern: localization_["minute"]
        }]
        for (var i = 0; i < data.length; i++) {
            const resp = builder(data[i].pattern, data[i].interval)
            if (resp) {
                return resp
            }
        }
    }
    function get_time(time) {
        var data = {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
        }
        return time.toLocaleDateString(lang_loc, data)
    }
    function line_builder(data, not_first = false) {
        var result = ""
        for (var i = 0; i < data.length; i++) {
            let first_el_modify = ""
            if (not_first) {
                first_el_modify = "style=\"border-top:0\""
            }
            result = result + `<div class="col themed-grid-col" 
      ${first_el_modify}>${data[i]}</div>`
        }
        return result
    }
    function build_table(json_body, orig_data) {
        const keys_ = Object.keys(json_body.data)
        const data_global_func = json_body.data
        const localization_ = lang_patterns[lang_loc]["time_converter_patterns"]
        var array_ = "",
            currency_update = false
        function currency_calculate(keys_data, data, currency_srv) {
            for (var i = 0; i < keys_data.length; i++) {
                data[keys_data[i]] = currency_process(data[keys_data[i]], currency_srv)
            }
            return data
        }
        for (var i = 0; i < keys_.length; i++) {
            var data_ = json_body.data
            if (["created_at_utc"].indexOf(keys_[i]) > -1) {
                data_[keys_[i]] = get_time(new Date(data_[keys_[i]]))
            }
            if (["was_launched"].indexOf(keys_[i]) > -1) {
                data_[keys_[i]] = `${timeAgoConvert(data_[keys_[i]])} ${localization_["later"]}`
            }
            if (!currency_update) {
                data_ = currency_calculate(["annualized_rate", "profit", "current_price", "float_profit", "total_price", "run-price"], data_, orig_data.currency)
                data_["current_price"] = `${data_["current_price"]} (${price_dif(data_["current_price"], data_["run-price"])}%)`
                currency_update = true
            }
            array_ = array_ + line_builder([lang_patterns[lang_loc][keys_[i]], data_[keys_[i]]], !i)
        }
        return array_
    }
    function build_trades_table(json_body, orig_data) {
        const lines_ = json_body.trades
        const localization_ = lang_patterns[lang_loc]
        let array_ = "",
            status_ = ""
        for (var i = 0; i < lines_.length; i++) {
            lines_[i]["trade_time"] = get_time(new Date(lines_[i]["trade_time"]))
            lines_[i]["profit"] = currency_process(lines_[i]["profit"], orig_data.currency)
            if (lines_[i]["profit"] == 0) {
                lines_[i]["profit"] = "-"
                status_ = localization_["buy_title"]
            } else {
                status_ = localization_["sell_title"]
            }
            array_ = array_ + line_builder([lines_[i]["trade_time"], lines_[i]["profit"], status_], !i)
        }
        return array_
    }
    function update_data(data) {
        const localization_ = lang_patterns[lang_loc]["time_converter_patterns"]
        const orig_data = data.data
        spot_selectio_buttons(orig_data.buttons_ids)
        data = orig_data.spot[selected_spot_global]
        document.title = `OkxGrid | ${currency_process(data.data.float_profit, orig_data.currency)} (${price_dif(data.data.current_price, data.data["run-price"])
            }%) | ${currency_global.toUpperCase()} | ${lang_loc.toUpperCase()}`
        document.getElementById("data_body").innerHTML = build_table(data, orig_data)
        document.getElementById("trade_body").innerHTML = build_trades_table(data, orig_data)
        document.getElementById("last_update_stamp").innerHTML = `${localization_["last_update"]}: ${get_time(new Date())}`
    }
    function build_spot_buttons(data) {
        result = ""
        for (var i = 0; i < data; i++) {
            result = result + `<li class="header-menu-item"><a class="link_header_ spot_select_button" id="spot_selectr_${i}">${i}</a></li>`
        }
        return result
    }
    function spot_selectio_buttons(buttons_ids) {
        document.getElementById("spot_selector_buttons").innerHTML = build_spot_buttons(buttons_ids)
    }
    function socket_() {
        const socket = io.connect(api_host)
        socket.on("connect", (function () {
            socket.emit("data_event", {
                data: "I'm connected!"
            })
        }))
        socket.on("message", (function (msg) {
            if (msg.data == "Connected" || msg.data == "I'm connected!") {
                return
            }
            update_data(msg)
        }))
    }
    function currency_change_notify() {
        notify(`${lang_patterns[lang_loc]["selected_currency"]} - ${currency_global.toUpperCase()}`)
    }
    function lang_change_notify() {
        notify(`${lang_patterns[lang_loc]["selected_lang"]} - ${lang_loc.toUpperCase()}`)
    }
    function buttons_update(buttons, button_id) {
        const all_buttons = document.getElementsByClassName(buttons)
        for (var i = 0; i < all_buttons.length; i++) {
            document.getElementById(all_buttons[i].id).style.color = null
        }
        document.getElementById(button_id).style.color = "#fff"
    }
    function update_currency(button_id) {
        const currency = button_id.replace("currency_", "")
        if (currency.length) {
            currency_global = currency
            setCookie("currency", currency)
            buttons_update("currency_button", button_id)
            currency_change_notify()
        }
    }
    function hide_splash() {
        document.getElementById("splash_screen").style.display = "none"
        document.getElementById("main_screen").style.display = null
    }
    function update_localization() {
        const localization_ = lang_patterns[lang_loc]
        const wait_ = ["grid", "trades"]
        const trades_ = ["time", "profit", "action"]
        const trades_name = "trade_table_title"
        for (const i in wait_) {
            let pattern_ = `localization_waiting_data_${wait_[i]}`
            try {
                document.getElementById(pattern_).innerHTML = localization_["localization_waiting_data"]
            } catch { }
        }
        for (const i in trades_) {
            document.getElementById(`${trades_name}_${trades_[i]}`).innerHTML = localization_[trades_name][trades_[i]]
        }
    }
    function update_lang(button_id) {
        const lang = button_id.replace("lang_", "")
        if (lang.length) {
            lang_loc = lang
            setCookie("lang", lang)
            buttons_update("lang_button", button_id)
            lang_change_notify()
        }
    }
    function update_spot_(button_id) {
        selected_spot_global = parseInt(button_id.replace("spot_selectr_", ""))
    }
    function init_other() {
        setInterval(update_localization, 100)
        setInterval(data_price_chart, 60 * 1000)
        setTimeout(hide_splash, 3 * 1000)
        const lang_cookie = getCookie("lang")
        if (lang_cookie) {
            lang_loc = lang_cookie
        }
        update_lang(`lang_${lang_loc}`)
        const currency_cookie = getCookie("currency")
        if (currency_cookie) {
            currency_global = currency_cookie
        }
        update_currency(`currency_${currency_global}`)
        socket_()
        price_chart_init()
        data_price_chart()
    }
    function init_lang_data() {
        getJson("lang.json", function (data) {
            lang_patterns = data
            init_other()
        })
    }
    document.body.addEventListener("click", function (event) {
        const button_id = event.target.id
        if (button_id.includes("currency_")) {
            update_currency(button_id)
        } else if (button_id.includes("lang_")) {
            update_lang(button_id)
        } else if (button_id.includes("spot_selectr_")) {
            update_spot_(button_id)
        }
    }, true)
    init_lang_data()
}))
