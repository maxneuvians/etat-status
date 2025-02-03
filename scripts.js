const summary_data_url = 'https://raw.githubusercontent.com/maxneuvians/etat-status/master/history/summary.json';
const image_url_base = 'https://raw.githubusercontent.com/maxneuvians/etat-status/master/graphs/';

const translations = {
    'en': {
        'uptime': 'Uptime',
        'response': 'Response',
        'period': 'Period',
        'average': 'Average response time',
        'overall': 'Overall',
        'down': 'Down',
        'problems': 'domains are reporting problems',
        'up': 'Up',
        '24h': '24h',
        '7d': '7d',
        '30d': '30d',
        '365d': '365d',
        'minutes': 'minutes',
        'operational': 'All systems are operational',
        'service': 'Service',
        'duration': 'Duration'
    },
    'fr': {
        'uptime': 'Temps de fonctionnement',
        'response': 'Réponse',
        'period': 'Epoque',
        'average': 'Temps de réponse moyen',
        'overall': 'Total',
        'down': 'En panne',
        'problems': 'domaines signalent des problèmes',
        'up': 'En marche',
        '24h': '24h',
        '7d': '7j',
        '30d': '30j',
        '365d': '365j',
        'minutes': 'minutes',
        'operational': 'Tous les systèmes sont opérationnels',
        'service': 'Service',
        'duration': 'Durée'
    }
}

function fold(e) {
    let foldable = e.querySelector('.foldable');
    if (foldable.style.display === 'none') {
        foldable.style.display = 'block';
    } else {
        foldable.style.display = 'none';
    }
}

function createCardComponent(item, lang) {
    let card = document.createElement('gcds-container');
    card.setAttribute('padding', '200');
    card.setAttribute('size', 'md');
    card.setAttribute('border', 'true');
    card.setAttribute('onclick', 'fold(this)');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Click to see more details')
    card.classList.add('m-100');
    if (item.status === 'down') {
        card.classList.add('status-down');
    } else {
        card.classList.add('status-up');
    }

    let domain = item.url.replace('https://', '').replace('http://', '').replace(/\/$/, "");
    let content = `
        <span class="title">
            <img src="${item.icon}" alt="favicon for ${domain}"/>
            ${domain}
        </span>
        <span class="uptime">
            ${item.uptime} | ${item.time} ms
        </span>
        <div class="foldable" style="display: none">
            <table class="detail-table">
                <thead>
                    <tr>
                        <th>${translations[lang]["period"]}</th>
                        <th>${translations[lang]["uptime"]}</th>
                        <th>${translations[lang]["average"]}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${translations[lang]["24h"]}</td>
                        <td>${item.uptimeDay}</td>
                        <td>${item.timeDay} ms</td>
                    </tr>
                    <tr>
                        <td>${translations[lang]["7d"]}</td>
                        <td>${item.uptimeWeek}</td>
                        <td>${item.timeWeek} ms</td>
                    </tr>
                    <tr>
                        <td>${translations[lang]["30d"]}</td>
                        <td>${item.uptimeMonth}</td>
                        <td>${item.timeMonth} ms</td>
                    </tr>
                    <tr>
                        <td>${translations[lang]["365d"]}</td>
                        <td>${item.uptimeYear}</td>
                        <td>${item.timeYear} ms</td>
                    </tr>
                    <tr>
                        <td>${translations[lang]["overall"]}</td>
                        <td>${item.uptime}</td>
                        <td>${item.time} ms</td>
                </tbody>
            </table>
        </div>
    `;

    card.innerHTML = content;
    return card;
}

function createIncidentCardComponent(date, items, lang) {
    let card = document.createElement('gcds-container');
    card.setAttribute('padding', '200');
    card.setAttribute('size', 'full');
    card.setAttribute('border', 'true');
    card.setAttribute('tabindex', '0');
    card.classList.add('mt-200');
    card.classList.add('status-down');

    let content = `
        <span class="title">
            ${date}
        </span>
        <div>
            <table class="detail-table">
                <thead>
                    <tr>
                        <th width="60%">${translations[lang]["service"]}</th>
                        <th width="40%">${translations[lang]["duration"]}</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td class="title">
                                <img src="${item.icon}" alt="icon for ${item.url.replace('https://', '').replace('http://', '').replace(/\/$/, "")}"/>
                                ${item.url.replace('https://', '').replace('http://', '').replace(/\/$/, "")}
                            </td>
                            <td>${item.dailyMinutesDown[date]} minutes</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    card.innerHTML = content;
    return card;
}

function createOverAllStatus(items, lang) {
    // Loop through all items and check if status attribute is 'up' or 'down'
    let downItems = items.filter(item => item.status === 'down');
    let statusBox = document.createElement('gcds-container');

    statusBox.setAttribute('size', 'full');
    statusBox.setAttribute('border', 'true');
    statusBox.setAttribute('padding', '200');
    statusBox.setAttribute('margin', '0');
    statusBox.setAttribute('tabindex', '0');

    if (downItems.length > 0) {
        statusBox.classList.add('down-list');
        statusBox.setAttribute('header', 'Down');
        statusBox.innerHTML = downList(downItems, lang);
    }
    else {
        statusBox.classList.add('status-up');
        statusBox.setAttribute('header', 'Up');
        statusBox.innerHTML = `<i class="fa fa-check" style="color:#1b9454"></i> ${translations[lang]["operational"]}`;
    }

    return statusBox;
}

function downList(items, lang) {
    let list = `
        <h4 class="mb-200">${items.length} ${translations[lang]["problems"]}</h4>
        <ul>
            ${items.map(item => `
                <li class="title">
                    <img src="${item.icon}" alt="icon"/>
                    ${item.url.replace('https://', '').replace('http://', '').replace(/\/$/, "")}
                </li>
            `).join('')}
        </ul>
    `;

    return list;
}

function loadData(lang) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', summary_data_url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var data = JSON.parse(xhr.responseText);

            var status = document.getElementById('overall-status');
            status.appendChild(createOverAllStatus(data, lang));

            var list = document.getElementById('list');
            list.innerHTML = '';

            for (var i = 0; i < data.length; i++) {
                var item = document.createElement('li');
                item.appendChild(createCardComponent(data[i], lang));
                list.appendChild(item);
            }

            let sorted = sortIncidentsIntoDates(data);
            renderIncidents(sorted, lang);
        }
    };
    xhr.send();
}

function renderIncidents(sortedData, lang) {
    // Create a card for each date
    const list = document.getElementById('incident-list');
    list.innerHTML = '';
    Object.keys(sortedData).forEach(date => {
        const item = document.createElement('li');
        item.appendChild(createIncidentCardComponent(date, sortedData[date], lang));
        list.appendChild(item);
    });
}

function sortIncidentsIntoDates(data) {
    // Remove any data with no down time
    const filteredData = data.filter(item => Object.keys(item.dailyMinutesDown).length > 0);

    // Sort data into dates
    const sortedData = filteredData.reduce((acc, item) => {
        const dates = Object.keys(item.dailyMinutesDown);
        dates.forEach(date => {
            if (acc[date]) {
                acc[date].push(item);
            } else {
                acc[date] = [item];
            }
        });
        return acc;
    }, {});

    let list = Object.keys(sortedData).map((key) => [key, sortedData[key]]);

    list.sort(function(a, b) {
        return new Date(b[0]) - new Date(a[0]);
    });

    return list.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});
}