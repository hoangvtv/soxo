'use strict';

function createStorage(key) {
    const storage = JSON.parse(localStorage.getItem(key)) ?? {};
    function save() {
        localStorage.setItem(key, JSON.stringify(storage));
    }
    
    return {
        get(key) {
            return storage[key];
        },
        set(key, value) {
            storage[key] = value;
            save();
        },
        remove(key) {
            delete storage[key];
            save();
        }
    };
}

function convertDate(d) {
    let hour = d.getHours();
    let minute = d.getMinutes();
    let date = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    return {
        date: `${date}/${month}/${year}`,
        time: `${hour}:${minute}`,
    }
}

const _$ = document.querySelector.bind(document);
const _$$ = document.querySelectorAll.bind(document);

const xocdiaStorage = createStorage('xocdia');
const moneyStorage = createStorage('money');

const resultContainer = _$('.js-result-container');
const betNavContainer = _$('.js-bet-nav-container');
const notifyContainer = _$('.js-notify-container');
const myMoneyElem = _$('.js-user-money');
const mainAudio = _$('.js-main-audio');
const loseAudio = _$('.js-lose-audio');
const victoryAudio = _$('.js-victory-audio');

let arrHistory = xocdiaStorage.get('history') || [];
let arrCountResult = xocdiaStorage.get('countResult') || new Array(2).fill(0);
let myMoney = moneyStorage.get('value') || 999999;
myMoneyElem.innerHTML = myMoney;

const app = {

    bet: [],
    totalBetMoney: 0,
    result: 0,
    betImg: [
        '../asset/img/xocdia/chan.png',
        '../asset/img/xocdia/le.png',
    ],
    resultImg: [
        '../asset/img/xocdia/chan-1.png',
        '../asset/img/xocdia/le-1.png',
        '../asset/img/xocdia/chan-2.png',
        '../asset/img/xocdia/le-2.png',
        '../asset/img/xocdia/chan-3.png',
        '../asset/img/xocdia/le-3.png',
        '../asset/img/xocdia/chan-4.png',
        '../asset/img/xocdia/le-4.png',
        '../asset/img/xocdia/chan-5.png',
        '../asset/img/xocdia/le-5.png',
        '../asset/img/xocdia/chan-6.png',
        '../asset/img/xocdia/le-6.png',
        '../asset/img/xocdia/chan-7.png',
        '../asset/img/xocdia/le-7.png',
        '../asset/img/xocdia/chan-8.png',
        '../asset/img/xocdia/le-8.png',
    ],
    resultImg2: [
        '../asset/img/xocdia/win.png',
        '../asset/img/xocdia/lose.png',
        '../asset/img/xocdia/hoa.png',
    ],

    handleEvent: function() {

        betNavContainer.addEventListener('click', function(e) {
            const _this = e.target;
            const isBetButton = _this.closest('.js-bet-button');
            const isReturnButton = _this.closest('.js-return-button');
            const isAllinButton = _this.closest('.js-allin-button');
            const isBetFastButton = _this.closest('.js-bet-fast-button');

            //xử lí đặt cược
            if (isBetButton) {
                const container = _this.parentNode.parentNode;
                const betInput = container.querySelector('.js-bet-input');

                const money = Math.abs(+betInput.value);
                const value = +container.dataset.value

                if (!money) {
                    alert('Chưa đặt cược kìa bạn ey!');
                    return;
                }
                else if (money > myMoney) {
                    alert('Tiền ít đòi hít lol thơm à bạn ey!');
                    betInput.value = myMoney;
                    return;
                }


                _$('.js-start-button').disabled = false;
                myMoney -= money;
                myMoneyElem.innerHTML = myMoney;

                const pos = app.bet.findIndex(i => i.value === value)
                pos !== -1
                ? app.bet[pos] = { value, money } 
                : app.bet.push({ value, money });
                
                app.totalBetMoney = -app.bet.reduce((a, b) => a + b.money, 0);
                notifyContainer.innerHTML = app.notifyComponent1(app.totalBetMoney)
                container.innerHTML = app.betStep2Component(money);
                container.classList.remove('unbet');
            }

            //xử lí đặt lại
            else if (isReturnButton) {
                const container = _this.parentNode;
                const value = +container.dataset.value
                const pos = app.bet.findIndex(i => i.value === value);
                const money = app.bet[pos].money;
                
                app.bet.splice(pos, 1);
                app.totalBetMoney += money;
                myMoney += money;
                myMoneyElem.innerHTML = myMoney;

                container.innerHTML = app.betStep1Component(money);
                container.classList.add('unbet');
                notifyContainer.innerHTML = app.notifyComponent1(app.totalBetMoney);
            }

            //xử lí all in
            else if (isAllinButton) {
                const container = _this.parentNode.parentNode;
                const betInput = container.querySelector('.js-bet-input');
                betInput.value = myMoney;
            }

            //xử lí đặt nhanh
            else if (isBetFastButton) {
                const container = _this.parentNode.parentNode;
                const betInput = container.querySelector('.js-bet-input');
                const money = +_this.dataset.value;
                
                betInput.value = +betInput.value + money;
            }
        })

        //xử lí bắt đầu
        resultContainer.addEventListener("click", function(e) {
            const isStartButton = e.target.closest('.js-start-button');
            
            if (isStartButton) {
                resultContainer.innerHTML = app.resultComponent2();
                _$$('.js-return-button').forEach(i => { i.remove() });
                if ( _$('.js-bet-wrapper.unbet')) {
                    _$('.js-bet-wrapper.unbet').innerHTML = '';
                }

                mainAudio.play();
                
                app.save();
                app.handleResult();
            }

        })

        notifyContainer.addEventListener("click", function(e) {
            const _this = e.target;
            const isContinueButton = _this.closest('.js-continue-button');

            //xử lí tiếp tục chơi
            if (isContinueButton) {
                resultContainer.innerHTML = app.resultComponent1();
                notifyContainer.innerHTML = '';
                app.bet.length = 0;
                app.totalBetMoney = 0;
                app.result = 0;
                _$$('.js-bet-wrapper').forEach(container => {
                    container.innerHTML = app.betStep1Component();
                    container.classList.add('unbet');
                })
            }
        })

        //show history
        const history = _$('.js-history');
        const closeButton = _$('.js-history-close-button');
        const overlay = _$('.js-history-overlay');
        _$('.js-history-button').addEventListener('click', function() {
            history.classList.add('is-open');
            overlay.classList.toggle('d-none');
        })

        closeButton.addEventListener('click', function() {
            overlay.classList.toggle('d-none');
            history.classList.remove('is-open');
        })

        overlay.addEventListener('click', function() {
            overlay.classList.toggle('d-none');
            history.classList.remove('is-open');
        })
    },

    //xử lí kết thúc
    handleResult: function() {
        let result = app.result % 2;
        let moneyIncome = app.totalBetMoney;
        let check = app.bet.findIndex(i => i.value === result);
        
        if (check !== -1) {
            moneyIncome = moneyIncome + app.bet[check].money * 2;
            myMoney = myMoney + app.bet[check].money * 2;
            myMoneyElem.innerHTML = myMoney;
        }

        if (moneyIncome > 0) {
            victoryAudio.play();
        }else if (moneyIncome < 0) {
            loseAudio.play();
        }

        notifyContainer.innerHTML = app.notifyComponent2(check !== -1, moneyIncome);

        const date = new Date();
        arrHistory.unshift({ 
            time: convertDate(date).time,
            date: convertDate(date).date,
            bet: [...app.bet],
            moneyIncome: moneyIncome,
            result: result,
        })

        if (arrHistory.length > 10) arrHistory.length = 10;
        arrCountResult[result]++;

        app.render();
        app.save();
    },

    renderHistory: function() {
        const historyContainer = _$('.js-history-body');


        const html = arrHistory.map((i, index) => {

            let result, moneyText;
            const betImage = i.bet.map(j => {
                return `
                    <img class="img-fluid rounded-circle" src="${app.betImg[j.value]}" alt="">
                `;
            }).join('')

            if (i.moneyIncome > 0){
                result = 0;
                moneyText = `<span class="text-success d-block">+${i.moneyIncome}</span>`;
            }else if (i.moneyIncome < 0){
                result = 1;
                moneyText = `<span class="text-danger d-block">${i.moneyIncome}</span>`;
            } else{
                result = 2
                moneyText = `<span class="text-success d-block">+${i.moneyIncome}</span>`;
            }

            return `
                <div class="history-item row">
                    <div class="p-2 col-4">
                            ${betImage}
                        <span>Đã cược</span>
                    </div>

                    <div class="p-2 col-4">
                        <span class="d-block" style="font-size: 12px;">#${index + 1}</span>
                        <img class="img-fluid" src="${app.resultImg2[result]}" alt="">
                        ${moneyText}
                        <span class="d-block" style="font-size: 12px;">22:22</span>
                        <span class="d-block" style="font-size: 12px;">21/01/1111</span>
                    </div>

                    <div class="p-2 col-4">
                        <img class="img-fluid rounded-circle" src="${app.betImg[i.result]}" alt="">
                        <span>Kết quả</span>
                    </div>
                </div>
            `
        }).join('');
        historyContainer.innerHTML = html;
    },

    renderSubHistory: function() {
        const container = _$('.js-sub-history');
        const html = arrHistory.map((i, index) => {
            return `
                <div style="flex: 1" class="text-center">
                    <span class="fw-bold fs-xs">#<span class="text-danger fs-s">${index + 1}</span></span> 
                    <img class="img-fluid rounded-circle" src="${app.betImg[i.result]}" alt="">
                </div>
            `;
        }).join('');
        container.innerHTML = html;
    },

    renderCountResult: function() {
        _$$('.js-count-result').forEach((i, index) => {
            i.innerHTML = arrCountResult[index];
        })
    },

    betStep1Component: function(money = '') {
        return `
            <div class="bet-input-wrapper position-relative">
                <input type="number" class="bet-input js-bet-input" value="${money}">
                <ul class="bet-fast-list">
                    <li data-value="1000000" class="bet-fast-button js-bet-fast-button text-danger fw-bold">+1000000</li>
                    <li data-value="500000" class="bet-fast-button js-bet-fast-button text-danger fw-bold">+500000</li>
                    <li data-value="100000" class="bet-fast-button js-bet-fast-button text-danger fw-bold">+100000</li>
                </ul>
            </div>
            <div>
                <button class="btn btn-success btn-sm mt-2 text-uppercase js-bet-button">bet</button>
                <button class="btn btn-danger btn-sm mt-2 text-uppercase js-allin-button">all in</button>
            </div>
        `;
    },

    betStep2Component: function(money) {
        return `
            <span class="bet-title fw-bold">Đã cược</span>
            <span class="d-block js-bet-money bet-money text-danger">${money}</span>
            <button class="btn btn-success btn-sm text-uppercase js-return-button">Nghĩ lại</button>
        `;
    },

    resultComponent1: function() {
        return `
            <img class="img-fluid result-un-start" src="../asset/img/xocdia/chuamo.png" alt="">
            <button class="btn btn-danger d-block m-auto text-uppercase js-start-button start-button" disabled>mở bát</button>
        `;
    },

    resultComponent2: function() {
        app.result = Math.floor(Math.random() * 16);
        return `
            <img class="img-fluid result-img" src="${app.resultImg[app.result]}" alt="">
        `;
    },

    notifyComponent1: function(money) {
        return `
            <span class="notify-title">Tạm thời</span>
            <span class="notify-money-decrease-temp">${money}</span>
        `
    },
    notifyComponent2: function(result, moneyIncome) {
        if (!result) {
            return `
                <img class="img-fluid rounded-circle shadow-me" src="${app.betImg[app.result % 2]}" alt="">
                <h3 class="text-danger mt-2">${moneyIncome}</h3>
                <button class="js-continue-button btn btn-sm btn-success d-block m-auto text-uppercase">Còn thở còn gỡ</button>
            `
        } else{
            return `
                <img class="img-fluid rounded-circle shadow-me" src="${app.betImg[app.result % 2]}" alt="">
                <h3 class="text-success mt-2">+${moneyIncome}</h3>
                <button class="js-continue-button btn btn-sm btn-success d-block m-auto text-uppercase">Tiếp tục ăn không</button>
            `
        }
        
    },

    save: function() {
        moneyStorage.set('value', myMoney);
        xocdiaStorage.set('history', arrHistory);
        xocdiaStorage.set('countResult', arrCountResult);
    },

    render: function() {
        app.renderHistory();
        app.renderSubHistory();
        app.renderCountResult();
    },

    start: function() {
        app.render();
        app.handleEvent();
    },
}

app.start();