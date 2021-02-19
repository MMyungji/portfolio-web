async function setRenderBackground() {
    const result = await axios.get("https://picsum.photos/1280/720", {
        responseType: "blob" // binary large object
    });
    // console.log(result);

    // img에 url로 src="url"
    const data = URL.createObjectURL(result.data);
    // console.log(data);
    document.querySelector("body").style.backgroundImage = `url(${data})`;
}

// 시계 설정 함수
function setTime() {
    const timer = document.querySelector(".timer");
    // console.log(new Date());
    // const date = new Date();
    // console.log(date.getHours());
    // console.log(date.getMinutes());
    // console.log(date.getSeconds());

    setInterval(() => { // 1초마다 갱신, 새로고침
        const date = new Date();
        timer.textContent = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }, 1000);
}

// 인사말 설정 함수
function setTimeContent() {
    const content = document.querySelector(".timer-content");
    // console.log(new Date());
    // const date = new Date();
    // console.log(date.getHours());
    // console.log(date.getMinutes());
    // console.log(date.getSeconds());

    setInterval(() => { // 1초마다 갱신, 새로고침
        const date = new Date();
        if(date.getHours >= 0 && date.getHours < 12){
            content.textContent = "Good Morning"
        } else {
            content.textContent = "Good Evening"
        }
    }, 1000);
}


// 메모 불러오기
function getMemo() {
    const memo = document.querySelector(".memo");
    const memoValue = localStorage.getItem("todo");
    memo.textContent = memoValue;
}

// 메모저장(storage -> local)
function setMemo() {
    const memoInput = document.querySelector(".memo-input");
    memoInput.addEventListener("keyup", function (e) {
        // console.log(e.code);
        // console.log(e.target.value);
        // 엔터로 저장, 공백 제외하고 값이 있을 때 저장
        if (e.code === 'Enter' && e.target.value) {
            localStorage.setItem("todo", e.target.value);
            getMemo(); // 메모를 저장할때, 바로 메모화면이 바뀌어야 하니까

            // 메모가 입력되고 난 후, 인풋 창의 글이 지워짐
            memoInput.value = ""
        }
    })
}

// memo 삭제
function deleteMemo() {
    document.addEventListener("click", function (e) {
        // console.log(e.target);
        if (e.target.classList.contains("memo")) {
            //localStorage item삭제
            localStorage.removeItem("todo");
            //memo html 비워주기
            e.target.textContent = "";
        }
    })
}

function memos() {
    setMemo();
    getMemo();
    deleteMemo();
}

// 위도 경도 가져오기 -> promise화
function getPosition(options) {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    })
}

// 날씨가져오기
// API Key = 63a69c18cb1aff002d3e0204203b3396
async function getWeather(latitude, longitude) {
    // 위도경도가 있는 경우
    if (latitude && longitude) {
        const data = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=63a69c18cb1aff002d3e0204203b3396`);
        return data;
    }
    //위도경도가 없는 경우
    const data = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=63a69c18cb1aff002d3e0204203b3396`);
    return data;
}
// getWeather('','').then(li => console.log(li)); // test

function matchIcon(weatherData) {
    if(weatherData === "Clear") return './images/039-sun.png';
    if(weatherData === "Clouds") return './images/001-cloud.png';
    if(weatherData === "Rain") return './images/003-rainy.png';
    if(weatherData === "Snow") return './images/006-snowy.png';
    if(weatherData === "Thunderstorm") return './images/008-storm.png';
    if(weatherData === "Drizzle") return './images/031-snowflake.png';
    if(weatherData === "Atmosphere") return './images/033-hurricane.png';
}


function weatherWrapperComponent(li){
    // console.log(li);
    // console.log(li.main.temp)
    const changeToCelsius = (temp) => (temp - 273.15).toFixed(1) + "°";
    return `
    <div class="card shadow-sm bg-transparent mb-3 m-2 flex-grow-1">
    <div class="card-header text-white text-center">
    ${li.dt_txt.split(" ")[0]}
    </div>
    
    <div class="card-body d-flex">
    <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <h5 class="card-title">
            ${li.weather[0].main}
        </h5>
        <img src="${matchIcon(li.weather[0].main)}" width="60px" height="60px"/>
        <p class="card-text">${changeToCelsius(li.main.temp)}</p>
    </div>
    </div>
    </div>
    `
}

function weatherContent(weather){
    const changeToCelsius = (temp) => (temp - 273.15).toFixed(1) + "°C";
    const content = weather.weather[0].main+" "+changeToCelsius(weather.main.temp);
    return content;
}


// 위도 경도 받아와서 데이터 가져오기
async function renderWeather() {
    let latitude = '';
    let longitude = '';

    try {
        const position = await getPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    } catch (err) {
        console.log(err);
    }
    const weatherResponse = await getWeather(latitude, longitude);
    // console.log(weatherResponse);
    const weatherData = weatherResponse.data;
    // console.log(weatherData);
    weatherList = weatherData.list.reduce((acc, cur) => {
        if (cur.dt_txt.indexOf("18:00:00") > 0) {
            acc.push(cur);
        }
        return acc;
    }, []);

    const modalBody = document.querySelector(".modal-body");
    modalBody.innerHTML = weatherList.map(li => {
        return weatherWrapperComponent(li);
    }).join("");

    // 날씨에 따라 아이콘, 글씨 설정
    const modalButton = document.querySelector(".modal-button");
    modalButton.style.backgroundImage = "url(" +matchIcon(weatherList[0].weather[0].main) + ")";

    const modalContent = document.querySelector(".modal-button-content");
    modalContent.textContent = weatherContent(weatherList[0]);

}


// html 파일에 함수 로드
(function () {
    setRenderBackground();
    setInterval(() => {
        setRenderBackground();
    }, 5000);
    renderWeather();
    setTime();
    setTimeContent();
    memos();
})();