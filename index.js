</script>
<!-- JSX syntax starts from here. -->
<script type="text/jsx">

loader.remove();

const { useRef, useState, useEffect } = React;

const SearchBar = ({ onNewLocation, onClose }) => {
    const input = useRef();
    const handleForm = (e) => {
        const { current } = input;
        e.preventDefault();
        onNewLocation(current.value);
        onClose(false);
        current.value = "";
    };
    return (
        <form onSubmit={(e) => handleForm(e)}>
            <label>Enter your location below:</label>
            <input ref={input} type="text" placeholder="Ex: New Delhi, India" required />
            <button type="submit">Search</button>
        </form>
    );
};

const Popup = ({ newLocation, show, onClose }) => (
    <div className="form-container" style={show ? { display: "block" } : { display: "none" }}>
        <SearchBar onNewLocation={newLocation} onClose={onClose} />
        <div className="search-options">
            <h4>Search By -</h4>
            <ul>
                <li>City name.</li>
                <li>City name, Country name/code.</li>
                <li>City name, State name.</li>
                <li>City name, State code, Country code.</li>
            </ul>
        </div>
    </div>
);

const LoaderPage = () => (
    <div className="loading-page">
        <span>Loading</span>
    </div>
);

const ErrorPage = ({ errCode, errMsg }) => (
    <div className="error-page">
        <span className="error-code">{errCode}</span>
        <span className="error-msg">{errMsg}</span>
    </div>
);

const AppHeader = ({ handleClick }) => (
    <header className="header-container">
        <h2>Weather app</h2>
        <span className="material-icons" onClick={(e) => handleClick(true)}>
            &#xef3a;
        </span>
    </header>
);

const CurrentWeather = ({ currData, icons }) => (
    <div className="current-weather">
        <span className="addr">
            {currData.name}, {currData.sys.country}
        </span>
        <div className="temp-container">
            <i className={"wi " + icons[currData.weather[0].icon]}></i>
            <span className="real-temp">{parseInt(currData.main.temp, 10) + "°c"}</span>
        </div>
        <span className="weather-discription">{currData.weather[0].description}</span>
    </div>
);

const WeatherDetails = ({ data }) => {
    const degToDir = (deg) => {
        return ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"][Math.round(deg / 22.5 + 1)];
    };

    return (
        <section className="weather-details">
            <h3>Current weather details</h3>
            <div className="current-weather-data">
                <span>
                    <i className="fas fa-temperature-low"></i>&nbsp;Feels like:
                    <br /> {data.main.feels_like}°c
                </span>
                <span>
                    <i className="fas fa-eye"></i>&nbsp;Visibilty:
                    <br /> {data.visibility / 1000}km
                </span>
                <span>
                    <i className="fas fa-wind"></i>&nbsp;Wind:
                    <br /> {data.wind.speed}m/s <span style={{ fontSize: "0.8em" }}>{degToDir(data.wind.deg)}</span>
                </span>
                <span>
                    <i className="fas fa-cloud"></i>&nbsp;Clouds:
                    <br /> {data.clouds.all}%
                </span>
            </div>
        </section>
    );
};

const AddForecastCards = ({ data, icons }) =>
    data ? (
        <ul>
            {data.map((obj, i) => {
                const time = new Date(obj.dt * 1000);
                return (
                    <li key={i}>
                        <span>{time.toLocaleString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <i className={"wi " + icons[obj.weather[0].icon]}></i>
                        <span>{obj.weather[0].description}</span>
                        <span>{parseInt(obj.temp, 10) + "°c"}</span>
                    </li>
                );
            })}
        </ul>
    ) : null;

const ForecastData = ({ coord, icons }) => {
    const api = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&units=metric&exclude=minutely,daily,alerts&appid=d441baed8246aee90a4a18b5d1f76fed`;
    const [data, setData] = useState();
    useEffect(() => {
        if (coord.lon) {
            fetch(api)
                .then((res) => res.json())
                .then((d) => setData(d.hourly.slice(0, 12)))
                .catch(console.error);
        }
    }, [coord, api]);
    return (
        <section className="forecast-data">
            <h3>Hourly forecast</h3>
            <AddForecastCards data={data} icons={icons} />
        </section>
    );
};

const AppContainer = ({ Loc, popup, changeLoc, icons }) => {
    const { loading, data, err } = useFetch(`https://api.openweathermap.org/data/2.5/weather?q=${Loc}&units=metric&appid=d441baed8246aee90a4a18b5d1f76fed`);
    const [coord, setCoord] = useState({ lon: undefined, lat: undefined });
    useEffect(() => {
        if (data) {
            setCoord({
                lon: data.coord.lon,
                lat: data.coord.lat,
            });
        }
    }, [data]);
    if (loading) return <LoaderPage />;
    if (err.code) return <ErrorPage errCode={err.code} errMsg={err.msg} />;
    return (
        <main
            className="app-container"
            style={
                popup
                    ? {}
                    : {
                          filter: "none",
                          pointerEvents: "auto",
                      }
            }
        >
            <AppHeader handleClick={changeLoc} />
            <CurrentWeather currData={data} icons={icons} />
            <WeatherDetails data={data} />
            <ForecastData coord={coord} icons={icons} />
        </main>
    );
};

const useFetch = (api) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState();
    const [err, setErr] = useState({ code: "", msg: "" });
    useEffect(() => {
        if (!api) return;
        fetch(api)
            .then((res) => res.json())
            .then((data) => {
                data.cod != 200 ? setErr({ code: data.cod, msg: data.message }) : setData(data);
            })
            .then(() => setLoading(false))
            .catch((e) => setErr({ code: String(e).substr(0, String(e).indexOf(":") + 1), msg: e.message }));
    }, [api]);
    return { loading, data, err };
};

const App = ({ icons }) => {
    const [showPopup, setPopup] = useState(true);
    const [Loc, setLoc] = useState("");

    return (
        <div>
            {!Loc ? (
                <main className="app-container">
                    <AppHeader handleClick={setPopup} />
                </main>
            ) : (
                <AppContainer popup={showPopup} Loc={Loc} changeLoc={setPopup} icons={icons} />
            )}
            <Popup show={showPopup} onClose={setPopup} newLocation={setLoc} />
        </div>
    );
};

const icons = {
    "01d": "wi-day-sunny",
    "01n": "wi-night-clear",
    "02d": "wi-day-cloudy",
    "02n": "wi-night-alt-cloudy",
    "03d": "wi-cloud",
    "03n": "wi-cloud",
    "04d": "wi-cloudy",
    "04n": "wi-cloudy",
    "09d": "wi-showers",
    "09n": "wi-showers",
    "10d": "wi-rain",
    "10n": "wi-rain",
    "11d": "wi-thunderstorm",
    "11n": "wi-thunderstorm",
    "13d": "wi-snowflake-cold",
    "13n": "wi-snowflake-cold",
    "50d": "wi-dust",
    "50n": "wi-dust",
};

ReactDOM.render(
    <App icons={icons} />, 
    root
);

</script>