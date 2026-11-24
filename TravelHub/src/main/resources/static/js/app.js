const API = "/api";

let user = null;
let cities = [];
let hotels = [];
let offers = [];

const $ = id => document.getElementById(id);

const formData = form => Object.fromEntries(new FormData(form));

async function api(path, method = "GET", body = null) {
    const options = {
        method,
        credentials: "same-origin",
        headers: {}
    };

    if (body !== null) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API + path, options);
    const text = await response.text();

    let data = text;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
    }

    if (!response.ok) {
        throw new Error(data?.message || data?.error || "HTTP " + response.status);
    }

    return data;
}

function notify(message) {
    $("status").textContent = message;

    setTimeout(() => {
        $("status").textContent = "";
    }, 4000);
}

function showPage(pageId) {
    if (pageId === "messages" && user?.role !== "ADMIN") {
        notify("Az üzenetek megtekintéséhez admin jogosultság szükséges.");
        pageId = "home";
    }

    if (pageId === "admin" && user?.role !== "ADMIN") {
        notify("Admin jogosultság szükséges.");
        pageId = "home";
    }

    document.querySelectorAll(".page").forEach(section => {
        section.classList.toggle("active", section.id === pageId);
    });

    if (pageId === "profile") {
        loadProfile();
    }

    if (pageId === "messages") {
        loadMessages();
    }

    if (pageId === "statistics") {
        loadStatistics();
    }

    if (pageId === "admin") {
        refreshAdmin();
    }
}

function updateNavigation() {
    document.querySelectorAll(".guest").forEach(element => {
        element.style.display = user ? "none" : "inline-block";
    });

    document.querySelectorAll(".auth").forEach(element => {
        element.style.display = user ? "inline-block" : "none";
    });

    document.querySelectorAll(".admin").forEach(element => {
        element.style.display = user?.role === "ADMIN" ? "inline-block" : "none";
    });
}

function fillOptions(select, items, valueKey, labelFunction, firstLabel = "Minden") {
    select.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = firstLabel;

    select.appendChild(firstOption);

    items.forEach(item => {
        const option = document.createElement("option");

        option.value = item[valueKey];
        option.textContent = labelFunction(item);

        select.appendChild(option);
    });
}

function getCity(id) {
    return cities.find(city => String(city.az) === String(id));
}

function getHotel(id) {
    return hotels.find(hotel => String(hotel.az) === String(id));
}

function getOfferHotelName(offer) {
    return getHotel(offer.szallodaAz)?.nev || offer.szallodaAz;
}

function createCard(title, text) {
    const container = document.createElement("article");
    container.className = "item";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    container.appendChild(heading);
    container.appendChild(paragraph);

    return container;
}

function renderCities() {
    $("citiesList").innerHTML = "";

    cities.forEach(city => {
        $("citiesList").appendChild(
            createCard(city.nev, city.orszag + " | ID: " + city.az)
        );
    });
}

function renderHotels() {
    $("hotelsList").innerHTML = "";

    const selectedCity = $("hotelCityFilter").value;

    hotels
        .filter(hotel => !selectedCity || String(hotel.helysegAz) === selectedCity)
        .forEach(hotel => {
            const cityName = getCity(hotel.helysegAz)?.nev || "";

            const text =
                cityName +
                " | " +
                hotel.besorolas +
                " csillag | Tengerpart: " +
                hotel.tengerpartTav +
                " | Repülőtér: " +
                hotel.repterTav +
                " | Félpanzió: " +
                (hotel.felpanzio ? "igen" : "nem");

            $("hotelsList").appendChild(
                createCard(hotel.nev, text)
            );
        });
}

function matchingOffers(cityId, maxPrice) {
    return offers.filter(offer => {
        const selectedHotel = getHotel(offer.szallodaAz);

        const cityMatch =
            !cityId ||
            String(selectedHotel?.helysegAz) === String(cityId);

        const priceMatch =
            !maxPrice ||
            Number(offer.ar) <= Number(maxPrice);

        return cityMatch && priceMatch;
    });
}

function renderOffers() {
    $("offersList").innerHTML = "";

    matchingOffers(
        $("offerCity").value,
        $("offerMax").value
    ).forEach(offer => {
        const selectedHotel = getHotel(offer.szallodaAz);
        const cityName = getCity(selectedHotel?.helysegAz)?.nev || "";

        const text =
            cityName +
            " | Indulás: " +
            offer.indulas +
            " | " +
            offer.idotartam +
            " nap | " +
            Number(offer.ar).toLocaleString("hu-HU") +
            " Ft";

        $("offersList").appendChild(
            createCard(getOfferHotelName(offer), text)
        );
    });
}

function renderHome() {
    $("homeResults").innerHTML = "";

    matchingOffers(
        $("homeCity").value,
        $("homeMax").value
    )
        .slice(0, 30)
        .forEach(offer => {
            const selectedHotel = getHotel(offer.szallodaAz);
            const cityName = getCity(selectedHotel?.helysegAz)?.nev || "";

            const text =
                cityName +
                " | " +
                offer.indulas +
                " | " +
                offer.idotartam +
                " nap | " +
                Number(offer.ar).toLocaleString("hu-HU") +
                " Ft";

            $("homeResults").appendChild(
                createCard(getOfferHotelName(offer), text)
            );
        });
}

async function loadAll() {
    try {
        const results = await Promise.all([
            api("/cities"),
            api("/hotels"),
            api("/offers")
        ]);

        cities = results[0];
        hotels = results[1];
        offers = results[2];

        fillOptions(
            $("homeCity"),
            cities,
            "az",
            city => city.nev + " - " + city.orszag
        );

        fillOptions(
            $("hotelCityFilter"),
            cities,
            "az",
            city => city.nev
        );

        fillOptions(
            $("offerCity"),
            cities,
            "az",
            city => city.nev
        );

        renderCities();
        renderHotels();
        renderOffers();
        renderHome();
        updateNavigation();
    } catch (error) {
        notify("Adatok betöltése sikertelen: " + error.message);
    }
}

async function login() {
    try {
        await api("/auth/login", "POST", formData($("loginForm")));

        await loadProfile();

        notify("Sikeres bejelentkezés");

        showPage("home");
    } catch (error) {
        notify("Bejelentkezési hiba: " + error.message);
    }
}

async function register() {
    try {
        await api("/auth/register", "POST", formData($("registerForm")));

        notify("Sikeres regisztráció. Most jelentkezz be.");

        showPage("login");
    } catch (error) {
        notify("Regisztrációs hiba: " + error.message);
    }
}

async function logout() {
    try {
        await api("/auth/logout", "POST");

        user = null;

        updateNavigation();

        showPage("home");

        notify("Sikeresen kijelentkeztél.");
    } catch (error) {
        notify("Kijelentkezési hiba: " + error.message);
    }
}

async function loadProfile() {
    try {
        user = await api("/auth/me");

        $("profileData").textContent = JSON.stringify(user, null, 2);
    } catch {
        user = null;

        $("profileData").textContent = "Nincs bejelentkezve.";
    }

    updateNavigation();
}

async function sendContact() {
    try {
        await api("/contact", "POST", formData($("contactForm")));

        $("contactForm").reset();

        notify("Üzenet sikeresen elküldve.");
    } catch (error) {
        notify("Üzenetküldési hiba: " + error.message);
    }
}

async function loadMessages() {
    if (user?.role !== "ADMIN") {
        $("messagesList").innerHTML = "";
        notify("Az üzenetek megtekintéséhez admin jogosultság szükséges.");
        showPage("home");
        return;
    }

    try {
        const messages = await api("/contact/messages");

        $("messagesList").innerHTML = "";

        messages.forEach(message => {
            const text =
                message.name +
                " | " +
                message.email +
                " | " +
                message.createdAt +
                " | " +
                message.message;

            $("messagesList").appendChild(
                createCard(message.subject, text)
            );
        });
    } catch (error) {
        $("messagesList").innerHTML = "";

        notify("Üzenetek betöltése sikertelen: " + error.message);
    }
}

async function loadStatistics() {
    try {
        const results = await Promise.all([
            api("/statistics/summary"),
            api("/statistics/offers-by-city"),
            api("/statistics/hotels-by-city"),
            api("/statistics/average-price-by-city")
        ]);

        $("statsData").innerHTML = "";

        const titles = [
            "Összesítés",
            "Ajánlatok városonként",
            "Szállodák városonként",
            "Átlagár városonként"
        ];

        results.forEach((result, index) => {
            $("statsData").appendChild(
                createCard(titles[index], JSON.stringify(result))
            );
        });
    } catch (error) {
        notify("Statisztikák betöltése sikertelen: " + error.message);
    }
}

function refreshAdmin() {
    if (user?.role !== "ADMIN") {
        notify("Admin jogosultság szükséges.");
        showPage("home");
        return;
    }

    fillOptions(
        $("cityPick"),
        cities,
        "az",
        city => city.az + " - " + city.nev,
        "Új város"
    );

    fillOptions(
        $("hotelPick"),
        hotels,
        "az",
        hotel => hotel.az + " - " + hotel.nev,
        "Új szálloda"
    );

    fillOptions(
        $("offerPick"),
        offers,
        "id",
        offer => offer.id + " - " + getOfferHotelName(offer),
        "Új ajánlat"
    );

    fillOptions(
        $("hotelForm").elements.helysegAz,
        cities,
        "az",
        city => city.nev,
        "Város kiválasztása"
    );

    fillOptions(
        $("offerForm").elements.szallodaAz,
        hotels,
        "az",
        hotel => hotel.nev,
        "Szálloda kiválasztása"
    );

    $("cityAdminList").textContent = cities
        .map(city => city.az + " | " + city.nev + " | " + city.orszag)
        .join("\n");

    $("hotelAdminList").textContent = hotels
        .map(hotel => hotel.az + " | " + hotel.nev)
        .join("\n");

    $("offerAdminList").textContent = offers
        .map(offer =>
            offer.id +
            " | " +
            getOfferHotelName(offer) +
            " | " +
            offer.indulas +
            " | " +
            offer.ar
        )
        .join("\n");
}

function setForm(form, data) {
    Object.keys(data).forEach(key => {
        if (form.elements[key]) {
            form.elements[key].value = data[key] ?? "";
        }
    });
}

async function saveEntity(path, id, data) {
    const method = id ? "PUT" : "POST";
    const url = id ? path + "/" + encodeURIComponent(id) : path;

    try {
        await api(url, method, data);

        await loadAll();

        refreshAdmin();

        notify("Mentés sikeres.");
    } catch (error) {
        notify("Mentési hiba: " + error.message);
    }
}

async function deleteEntity(path, id) {
    if (!id) {
        return;
    }

    if (!confirm("Biztosan törölni szeretnéd a rekordot?")) {
        return;
    }

    try {
        await api(path + "/" + encodeURIComponent(id), "DELETE");

        await loadAll();

        refreshAdmin();

        notify("Törlés sikeres.");
    } catch (error) {
        notify("Törlési hiba: " + error.message);
    }
}

$("nav").addEventListener("click", event => {
    const button = event.target.closest("[data-page]");

    if (button) {
        showPage(button.dataset.page);
    }
});

$("logout").addEventListener("click", logout);

$("loginForm").addEventListener("submit", event => {
    event.preventDefault();
    login();
});

$("registerForm").addEventListener("submit", event => {
    event.preventDefault();
    register();
});

$("contactForm").addEventListener("submit", event => {
    event.preventDefault();
    sendContact();
});

$("profileRefresh").addEventListener("click", loadProfile);
$("messagesRefresh").addEventListener("click", loadMessages);
$("statsRefresh").addEventListener("click", loadStatistics);
$("homeSearch").addEventListener("click", renderHome);
$("offerSearch").addEventListener("click", renderOffers);

$("hotelCityFilter").addEventListener("change", renderHotels);
$("homeCity").addEventListener("change", renderHome);
$("offerCity").addEventListener("change", renderOffers);

document.querySelectorAll("[data-admin]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".adminTab").forEach(section => {
            section.classList.remove("active");
        });

        $(button.dataset.admin).classList.add("active");
    });
});

$("cityPick").addEventListener("change", () => {
    const city = cities.find(
        item => String(item.az) === $("cityPick").value
    );

    if (city) {
        setForm($("cityForm"), city);
    } else {
        $("cityForm").reset();
    }
});

$("hotelPick").addEventListener("change", () => {
    const hotel = hotels.find(
        item => String(item.az) === $("hotelPick").value
    );

    if (hotel) {
        setForm($("hotelForm"), hotel);
    } else {
        $("hotelForm").reset();
    }
});

$("offerPick").addEventListener("change", () => {
    const offer = offers.find(
        item => String(item.id) === $("offerPick").value
    );

    if (offer) {
        setForm($("offerForm"), offer);
    } else {
        $("offerForm").reset();
    }
});

$("cityForm").addEventListener("submit", async event => {
    event.preventDefault();

    const data = formData(event.target);
    data.az = Number(data.az);

    await saveEntity(
        "/cities",
        $("cityPick").value,
        data
    );
});

$("hotelForm").addEventListener("submit", async event => {
    event.preventDefault();

    const data = formData(event.target);

    [
        "besorolas",
        "helysegAz",
        "tengerpartTav",
        "repterTav",
        "felpanzio"
    ].forEach(key => {
        data[key] = Number(data[key]);
    });

    await saveEntity(
        "/hotels",
        $("hotelPick").value,
        data
    );
});

$("offerForm").addEventListener("submit", async event => {
    event.preventDefault();

    const data = formData(event.target);

    data.idotartam = Number(data.idotartam);
    data.ar = Number(data.ar);

    const id = $("offerPick").value;

    if (id) {
        data.id = Number(id);
    }

    await saveEntity(
        "/offers",
        id,
        data
    );
});

$("cityDelete").addEventListener("click", () => {
    deleteEntity("/cities", $("cityPick").value);
});

$("hotelDelete").addEventListener("click", () => {
    deleteEntity("/hotels", $("hotelPick").value);
});

$("offerDelete").addEventListener("click", () => {
    deleteEntity("/offers", $("offerPick").value);
});

loadProfile().then(loadAll);

showPage("home");