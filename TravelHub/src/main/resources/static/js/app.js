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

    let response;

    try {
        response = await fetch(API + path, options);
    } catch {
        throw new Error("A szerver nem érhető el (" + method + " " + API + path + ")");
    }
    const text = await response.text();

    let data = text;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
    }

    if (!response.ok) {
        throw new Error(
            (data?.message || data?.error || "HTTP " + response.status) +
            " (" + method + " " + API + path + ")"
        );
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

function showListError(message) {
    ["citiesList", "hotelsList", "offersList", "homeResults"].forEach(containerId => {
        clearPaged(containerId);

        const error = document.createElement("p");
        error.className = "list_error";
        error.textContent = message;

        byId(containerId).appendChild(error);
    });
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

        if (user?.role === "ADMIN") {
            refreshAdmin();
        }
    } catch (error) {
        notify("Adatok betöltése sikertelen: " + error.message);
        showListError("Az adatok nem tölthetők be: " + error.message);
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


let statisticsCharts = [];

async function loadStatistics() {
    try {
        const results = await Promise.all([
            api("/statistics/summary"),
            api("/statistics/offers-by-city"),
            api("/statistics/hotels-by-city"),
            api("/statistics/average-price-by-city")
        ]);

        const [summary, offers, hotels, prices] = results;

        const statsData = byId("statsData");

        // Korábbi diagramok törlése
        statisticsCharts.forEach(chart => chart.destroy());
        statisticsCharts = [];

        // Korábbi tartalom törlése
        statsData.innerHTML = "";

        // Összesítő kártyák
        const summaryContainer = document.createElement("div");
        summaryContainer.className = "stats-summary";

        const summaryItems = [
            { title: "Városok", value: summary.cities },
            { title: "Szállodák", value: summary.hotels },
            { title: "Ajánlatok", value: summary.offers }
        ];

        summaryItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "stats-summary-card";

            card.innerHTML = `
                <h4>${item.title}</h4>
                <h2>${item.value}</h2>
            `;

            summaryContainer.appendChild(card);
        });

        statsData.appendChild(summaryContainer);

        // Diagramok létrehozása
        const charts = [
            {
                title: "Ajánlatok városonként",
                data: offers,
                label: "Ajánlatok száma",
                valueKey: "value",
                color: "rgba(54, 162, 235, 0.7)"
            },
            {
                title: "Szállodák városonként",
                data: hotels,
                label: "Szállodák száma",
                valueKey: "value",
                color: "rgba(75, 192, 192, 0.7)"
            },
            {
                title: "Átlagár városonként",
                data: prices,
                label: "Átlagár (Ft)",
                valueKey: "averagePrice",
                color: "rgba(255, 159, 64, 0.7)"
            }
        ];

        charts.forEach((item, index) => {
            const container = document.createElement("div");
            container.className = "card p-4 mb-4";

            const title = document.createElement("h4");
            title.textContent = item.title;

            const canvas = document.createElement("canvas");
            canvas.id = `statisticsChart${index}`;

            container.appendChild(title);
            container.appendChild(canvas);
            statsData.appendChild(container);

            const chart = new Chart(canvas, {
                type: "bar",
                data: {
                    labels: item.data.map(entry => entry.city),
                    datasets: [{
                        label: item.label,
                        data: item.data.map(entry => entry[item.valueKey]),
                        backgroundColor: item.color,
                        borderColor: item.color.replace("0.7", "1"),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            statisticsCharts.push(chart);
        });

    } catch (error) {
        notify("Statisztikák betöltése sikertelen: " + error.message);
    }
}

function refreshAdmin(selected = {}) {
    if (user?.role !== "ADMIN") {
        notify("Admin jogosultság szükséges.");
        showPage("home");
        return;
    }

    const previous = {
        cityPick: byId("cityPick").value,
        hotelPick: byId("hotelPick").value,
        offerPick: byId("offerPick").value
    };

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

    Object.keys(previous).forEach(pickId => {
        const select = byId(pickId);

        select.value = String(selected[pickId] ?? previous[pickId]);

        if (select.selectedIndex === -1) {
            select.selectedIndex = 0;
        }
    });

    loadPicked("cityPick", "cityForm", cities, "az");
    loadPicked("hotelPick", "hotelForm", hotels, "az");
    loadPicked("offerPick", "offerForm", offers, "id");
}

function setForm(form, data) {
    Object.keys(data).forEach(key => {
        if (form.elements[key]) {
            let value = data[key] ?? "";

            if (typeof value === "boolean") {
                value = Number(value);
            }

            form.elements[key].value = value;
        }
    });
}

// A kiválasztott rekordot betölti az űrlapba; a kulcs mező szerkesztéskor csak olvasható
function loadPicked(pickId, formId, items, key) {
    const form = byId(formId);
    const item = items.find(entry => String(entry[key]) === byId(pickId).value);

    if (item) {
        setForm(form, item);
    } else {
        form.reset();
    }

    if (form.elements[key]) {
        form.elements[key].readOnly = key === "id" || Boolean(item);
    }
}

async function saveEntity(path, id, data, pickId, key) {
    const method = id ? "PUT" : "POST";
    const url = id ? path + "/" + encodeURIComponent(id) : path;

    try {
        const saved = await api(url, method, data);

        await loadAll();

        // szerkesztés után ugyanaz marad kiválasztva, új rekordnál az újonnan létrehozott
        const savedId = id || (saved?.[key] ?? data[key] ?? "");

        refreshAdmin({ [pickId]: savedId });

        notify("Mentés sikeres.");
    } catch (error) {
        notify("Mentési hiba: " + error.message);
    }
}

async function deleteEntity(path, id, pickId) {
    if (!id) {
        notify("Előbb válassz ki egy rekordot a listából.");
        return;
    }

    if (!confirm("Biztosan törölni szeretnéd a rekordot?")) {
        return;
    }

    try {
        await api(path + "/" + encodeURIComponent(id), "DELETE");

        await loadAll();

        refreshAdmin({ [pickId]: "" });

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

byId("cityPick").addEventListener("change", () => loadPicked("cityPick", "cityForm", cities, "az"));
byId("hotelPick").addEventListener("change", () => loadPicked("hotelPick", "hotelForm", hotels, "az"));
byId("offerPick").addEventListener("change", () => loadPicked("offerPick", "offerForm", offers, "id"));

// "Új" gomb: a kiválasztás is törlődjön, különben a következő mentés a régi rekordot írná felül
[["cityForm", "cityPick", "az"], ["hotelForm", "hotelPick", "az"], ["offerForm", "offerPick", "id"]]
    .forEach(([formId, pickId, key]) => {
        byId(formId).addEventListener("reset", () => {
            byId(pickId).value = "";
            if (byId(formId).elements[key]) {
                byId(formId).elements[key].readOnly = key === "id";
            }
        });
    });

byId("cityForm").addEventListener("submit", async event => {
    event.preventDefault();

    const data = formData(event.target);

    await saveEntity(
        "/cities",
        byId("cityPick").value,
        data,
        "cityPick",
        "az"
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
        data,
        "hotelPick",
        "az"
    );
});

byId("offerForm").addEventListener("submit", async event => {
    event.preventDefault();

    const data = formData(event.target);

    data.idotartam = Number(data.idotartam);
    data.ar = Number(data.ar);

    const id = byId("offerPick").value;

    await saveEntity(
        "/offers",
        id,
        data,
        "offerPick",
        "id"
    );
});

byId("cityDelete").addEventListener("click", () => {
    deleteEntity("/cities", byId("cityPick").value, "cityPick");
});

byId("hotelDelete").addEventListener("click", () => {
    deleteEntity("/hotels", byId("hotelPick").value, "hotelPick");
});

byId("offerDelete").addEventListener("click", () => {
    deleteEntity("/offers", byId("offerPick").value, "offerPick");
});

loadProfile().then(loadAll);

showPage("home");