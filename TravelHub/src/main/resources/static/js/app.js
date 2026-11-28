const API = "/api";

let user = null;
let cities = [];
let hotels = [];
let offers = [];

const byId = id => document.getElementById(id);

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
    byId("status").textContent = message;

    setTimeout(() => {
        byId("status").textContent = "";
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

function goTo(pageId) {
    showPage(pageId);
    byId(pageId)?.scrollIntoView({ behavior: "smooth" });
}

function updateNavigation() {
    document.querySelectorAll(".guest").forEach(element => {
        element.style.display = user ? "none" : "";
    });

    document.querySelectorAll(".auth").forEach(element => {
        element.style.display = user ? "" : "none";
    });

    document.querySelectorAll(".admin").forEach(element => {
        element.style.display = user?.role === "ADMIN" ? "" : "none";
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

const PAGE_SIZE = 12;

function clearPaged(containerId) {
    byId(containerId).innerHTML = "";
    byId(containerId + "More")?.remove();
}

function renderPaged(containerId, items, buildCard, pageSize = PAGE_SIZE) {
    const container = byId(containerId);
    container.innerHTML = "";

    let more = byId(containerId + "More");

    if (!more) {
        more = document.createElement("div");
        more.id = containerId + "More";
        more.className = "load_more";
        container.insertAdjacentElement("afterend", more);
    }

    more.innerHTML = "";

    const info = document.createElement("p");
    info.className = "load_more_info";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "main-btn";
    button.textContent = "Továbbiak betöltése";

    let shown = 0;

    function showNext() {
        items.slice(shown, shown + pageSize).forEach(item => {
            container.appendChild(buildCard(item));
        });

        shown = Math.min(shown + pageSize, items.length);

        info.textContent = items.length
            ? shown + " / " + items.length + " találat"
            : "Nincs találat.";

        button.style.display = shown < items.length ? "" : "none";
    }

    button.addEventListener("click", showNext);
    more.append(info, button);

    showNext();
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
    renderPaged("citiesList", cities, city =>
        createCard(city.nev, city.orszag + " | ID: " + city.az)
    );
}

function renderHotels() {
    const selectedCity = byId("hotelCityFilter").value;

    const filtered = hotels.filter(
        hotel => !selectedCity || String(hotel.helysegAz) === selectedCity
    );

    renderPaged("hotelsList", filtered, hotel => {
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

        return createCard(hotel.nev, text);
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
    const filtered = matchingOffers(
        byId("offerCity").value,
        byId("offerMax").value
    );

    renderPaged("offersList", filtered, offer => {
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

        return createCard(getOfferHotelName(offer), text);
    });
}

function renderHome() {
    const filtered = matchingOffers(
        byId("homeCity").value,
        byId("homeMax").value
    );

    renderPaged("homeResults", filtered, offer => {
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

        return createCard(getOfferHotelName(offer), text);
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
            byId("homeCity"),
            cities,
            "az",
            city => city.nev + " - " + city.orszag
        );

        fillOptions(
            byId("hotelCityFilter"),
            cities,
            "az",
            city => city.nev
        );

        fillOptions(
            byId("offerCity"),
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
        await api("/auth/login", "POST", formData(byId("loginForm")));

        await loadProfile();

        notify("Sikeres bejelentkezés");

        goTo("home");
    } catch (error) {
        notify("Bejelentkezési hiba: " + error.message);
    }
}

async function register() {
    try {
        await api("/auth/register", "POST", formData(byId("registerForm")));

        notify("Sikeres regisztráció. Most jelentkezz be.");

        goTo("login");
    } catch (error) {
        notify("Regisztrációs hiba: " + error.message);
    }
}

async function logout() {
    try {
        await api("/auth/logout", "POST");

        user = null;

        updateNavigation();

        goTo("home");

        notify("Sikeresen kijelentkeztél.");
    } catch (error) {
        notify("Kijelentkezési hiba: " + error.message);
    }
}

async function loadProfile() {
    try {
        user = await api("/auth/me");

        byId("profileData").textContent = JSON.stringify(user, null, 2);
    } catch {
        user = null;

        byId("profileData").textContent = "Nincs bejelentkezve.";
    }

    updateNavigation();
}

async function sendContact() {
    try {
        await api("/contact", "POST", formData(byId("contactForm")));

        byId("contactForm").reset();

        notify("Üzenet sikeresen elküldve.");
    } catch (error) {
        notify("Üzenetküldési hiba: " + error.message);
    }
}

async function loadMessages() {
    if (user?.role !== "ADMIN") {
        clearPaged("messagesList");
        notify("Az üzenetek megtekintéséhez admin jogosultság szükséges.");
        showPage("home");
        return;
    }

    try {
        const messages = await api("/contact/messages");

        clearPaged("messagesList");

        renderPaged("messagesList", messages, message => {
            const text =
                message.name +
                " | " +
                message.email +
                " | " +
                message.createdAt +
                " | " +
                message.message;

            return createCard(message.subject, text);
        });
    } catch (error) {
        clearPaged("messagesList");

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

        byId("statsData").innerHTML = "";

        const titles = [
            "Összesítés",
            "Ajánlatok városonként",
            "Szállodák városonként",
            "Átlagár városonként"
        ];

        results.forEach((result, index) => {
            byId("statsData").appendChild(
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
        byId("cityPick"),
        cities,
        "az",
        city => city.az + " - " + city.nev,
        "Új város"
    );

    fillOptions(
        byId("hotelPick"),
        hotels,
        "az",
        hotel => hotel.az + " - " + hotel.nev,
        "Új szálloda"
    );

    fillOptions(
        byId("offerPick"),
        offers,
        "id",
        offer => offer.id + " - " + getOfferHotelName(offer),
        "Új ajánlat"
    );

    fillOptions(
        byId("hotelForm").elements.helysegAz,
        cities,
        "az",
        city => city.nev,
        "Város kiválasztása"
    );

    fillOptions(
        byId("offerForm").elements.szallodaAz,
        hotels,
        "az",
        hotel => hotel.nev,
        "Szálloda kiválasztása"
    );

    byId("cityAdminList").textContent = cities
        .map(city => city.az + " | " + city.nev + " | " + city.orszag)
        .join("\n");

    byId("hotelAdminList").textContent = hotels
        .map(hotel => hotel.az + " | " + hotel.nev)
        .join("\n");

    byId("offerAdminList").textContent = offers
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

byId("nav").addEventListener("click", event => {
    const link = event.target.closest("a.page-scroll");

    if (link && link.hash) {
        showPage(link.hash.slice(1));
    }
});

byId("logout").addEventListener("click", event => {
    event.preventDefault();
    logout();
});

byId("loginForm").addEventListener("submit", event => {
    event.preventDefault();
    login();
});

byId("registerForm").addEventListener("submit", event => {
    event.preventDefault();
    register();
});

byId("contactForm").addEventListener("submit", event => {
    event.preventDefault();
    sendContact();
});

byId("profileRefresh").addEventListener("click", loadProfile);
byId("messagesRefresh").addEventListener("click", loadMessages);
byId("statsRefresh").addEventListener("click", loadStatistics);
byId("homeSearch").addEventListener("click", renderHome);
byId("offerSearch").addEventListener("click", renderOffers);

byId("hotelCityFilter").addEventListener("change", renderHotels);
byId("homeCity").addEventListener("change", renderHome);
byId("offerCity").addEventListener("change", renderOffers);

document.querySelectorAll("[data-admin]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".adminTab").forEach(section => {
            section.classList.remove("active");
        });

        byId(button.dataset.admin).classList.add("active");
    });
});

byId("cityPick").addEventListener("change", () => {
    const city = cities.find(
        item => String(item.az) === byId("cityPick").value
    );

    if (city) {
        setForm(byId("cityForm"), city);
    } else {
        byId("cityForm").reset();
    }
});

byId("hotelPick").addEventListener("change", () => {
    const hotel = hotels.find(
        item => String(item.az) === byId("hotelPick").value
    );

    if (hotel) {
        setForm(byId("hotelForm"), hotel);
    } else {
        byId("hotelForm").reset();
    }
});

byId("offerPick").addEventListener("change", () => {
    const offer = offers.find(
        item => String(item.id) === byId("offerPick").value
    );

    if (offer) {
        setForm(byId("offerForm"), offer);
    } else {
        byId("offerForm").reset();
    }
});

byId("cityForm").addEventListener("submit", async event => {
    event.preventDefault();

    const data = formData(event.target);
    data.az = Number(data.az);

    await saveEntity(
        "/cities",
        byId("cityPick").value,
        data
    );
});

byId("hotelForm").addEventListener("submit", async event => {
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
        byId("hotelPick").value,
        data
    );
});

byId("offerForm").addEventListener("submit", async event => {
    event.preventDefault();

    const data = formData(event.target);

    data.idotartam = Number(data.idotartam);
    data.ar = Number(data.ar);

    const id = byId("offerPick").value;

    if (id) {
        data.id = Number(id);
    }

    await saveEntity(
        "/offers",
        id,
        data
    );
});

byId("cityDelete").addEventListener("click", () => {
    deleteEntity("/cities", byId("cityPick").value);
});

byId("hotelDelete").addEventListener("click", () => {
    deleteEntity("/hotels", byId("hotelPick").value);
});

byId("offerDelete").addEventListener("click", () => {
    deleteEntity("/offers", byId("offerPick").value);
});

loadProfile().then(loadAll);

showPage("home");