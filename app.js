// Premier Junior Max La Manga - Lógica Frontend

document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica de Pestañas (Tabs)
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 2. Ya no usaremos datos simulados. Se inicia vacío.
    let teams = [];
    let matches = [];

    // Función para leer un CSV directamente sin PHP!
    async function parseCSV(filename) {
        const response = await fetch(filename + '?t=' + new Date().getTime());
        if (!response.ok) return [];
        const text = await response.text();

        // Separar por líneas enteras (Maneja Windows y Mac/Linux)
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        // Detectar si el Excel del usuario está usando comas (,) o punto y coma (;)
        const separator = lines[0].includes(';') ? ';' : ',';

        // Leer los títulos
        const headers = lines[0].split(separator).map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(separator);
            if (row.length === headers.length) {
                let obj = {};
                headers.forEach((h, index) => {
                    obj[h] = row[index] ? row[index].trim() : '';
                });
                data.push(obj);
            }
        }
        return data;
    }

    // 3. Conexión DIRECTA a tus archivos de Excel
    async function loadDataFromDB() {
        try {
            const parsedTeams = await parseCSV('equipos.csv');
            const parsedMatches = await parseCSV('partidos.csv');
            
            // Fila de prueba en consola
            console.log("Equipos leídos tal cual del CSV:", parsedTeams);

            if (parsedTeams.length > 0) {
                // Filtra solo los equipos que tienen activo=1
                teams = parsedTeams.filter(t => t.activo == '1' || t.activo === 1);
                
                // Mapear cabeceras en español a nombres internos para que el resto del código funcione
                matches = parsedMatches.map(m => ({
                    id: m.id,
                    jornada: m.jornada,
                    home_team_id: m.id_local,
                    away_team_id: m.id_visitante,
                    home_score: parseInt(m.goles_local) || 0,
                    away_score: parseInt(m.goles_visitante) || 0,
                    status: m.estado, // 'finalizado' o 'programado'
                    date: m.fecha
                }));
                
                if(teams.length === 0) {
                    alert('El archivo equipos.csv se cargó bien, pero ningún equipo tiene un 1 en la columna "activo". Aparecerán vacíos.');
                }
            } else {
                alert("ALERTA: El sistema leyó tu archivo equipos.csv pero parece estar en blanco o tiene un formato incorrecto. ¡Abre la consola F12 para ver más detalles!");
            }
        } catch (e) {
            alert("Error crítico al leer el archivo Excel: " + e.message);
        }
        renderAll();
    }

    // 4. Ordenar y calcular (Dinámico)
    function calculateStandings() {
        // 1. Inicializar mapa de estadísticas en cero para cada equipo activo
        const standingsMap = {};
        teams.forEach(t => {
            standingsMap[t.id] = {
                id: t.id,
                Equipo: t.Equipo,
                logo: t.logo,
                PJ: 0, G: 0, E: 0, P: 0,
                GF: 0, GC: 0, DG: 0,
                Puntos: 0,
                activo: t.activo
            };
        });

        // 2. Procesar partidos finalizados para sumar puntos y goles
        matches.forEach(m => {
            if (m.status === 'finalizado') {
                const homeId = m.home_team_id;
                const awayId = m.away_team_id;
                const hScore = parseInt(m.home_score) || 0;
                const aScore = parseInt(m.away_score) || 0;

                // Solo procesar si ambos equipos existen en la lista de activos
                if (standingsMap[homeId] && standingsMap[awayId]) {
                    const home = standingsMap[homeId];
                    const away = standingsMap[awayId];

                    home.PJ++;
                    away.PJ++;
                    home.GF += hScore;
                    home.GC += aScore;
                    away.GF += aScore;
                    away.GC += hScore;

                    if (hScore > aScore) {
                        home.G++;
                        home.Puntos += 3;
                        away.P++;
                    } else if (aScore > hScore) {
                        away.G++;
                        away.Puntos += 3;
                        home.P++;
                    } else {
                        home.E++;
                        away.E++;
                        home.Puntos += 1;
                        away.Puntos += 1;
                    }
                    
                    home.DG = home.GF - home.GC;
                    away.DG = away.GF - away.GC;
                }
            }
        });

        // 3. Convertir a array y aplicar el orden oficial (Puntos > DG > GF)
        let standings = Object.values(standingsMap);
        standings.sort((a, b) => {
            if (b.Puntos !== a.Puntos) return b.Puntos - a.Puntos;
            if (b.DG !== a.DG) return b.DG - a.DG;
            return b.GF - a.GF;
        });

        return standings;
    }

    // 5. Renderizar Tabla de Posiciones de forma Dinámica
    function renderStandings(standings) {
        const thead = document.getElementById('standings-head');
        const tbody = document.getElementById('standings-body');
        thead.innerHTML = '';
        tbody.innerHTML = '';

        if (standings.length === 0) return;

        // Ocultar columnas técnicas
        const hiddenCols = ['id', 'logo', 'activo'];

        // Obtener nombres de columnas dinámicos leídos del CSV
        const keys = Object.keys(standings[0]);

        // Dibujar Títulos en <thead>
        let theadHTML = `<th>Pos</th>`;
        keys.forEach(key => {
            if (!hiddenCols.includes(key)) {
                theadHTML += `<th>${key}</th>`;
            }
        });
        thead.innerHTML = theadHTML;

        // Dibujar Contenidos en <tbody>
        standings.forEach((team, index) => {
            const tr = document.createElement('tr');
            tr.className = 'clickable-row';
            tr.onclick = () => window.openTeamModal(team.id);

            let rowHTML = `<td class="rank">${index + 1}</td>`;

            keys.forEach(key => {
                if (!hiddenCols.includes(key)) {
                    // Trato especial para la columna del nombre que lleva imagen
                    if (key === 'Equipo' || key === 'name') {
                        const img = team.logo ? team.logo : 'premier_junior.jpg';
                        rowHTML += `<td class="team-cell team-name">
                            <img src="${img}" alt="escudo" class="team-logo-small">
                            ${team[key]}
                        </td>`;
                    } 
                    // Resaltar la columna Puntos si existe
                    else if (key === 'Puntos' || key === 'points') {
                        rowHTML += `<td class="rank" style="font-size: 1.1em">${team[key]}</td>`;
                    }
                    // El resto de columnas dinámicas que se hayan creado en el Excel
                    else {
                        rowHTML += `<td>${team[key]}</td>`;
                    }
                }
            });
            tr.innerHTML = rowHTML;
            tbody.appendChild(tr);
        });
    }

    // Renderizar los partidos agrupados por jornada, pero permitiendo elegir cuál ver
    function renderMatches(containerId, isFinished, selectedRound = null) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        // Filtrar primero por estado (finalizado o programado)
        let filteredMatches = matches.filter(m => isFinished ? m.status === 'finalizado' : m.status !== 'finalizado');

        // Si no hay partidos de ese tipo, salir
        if (filteredMatches.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">No hay partidos en esta categoría.</p>`;
            return;
        }

        // Si hay una jornada seleccionada, filtrar por ella. 
        // Si no, buscaremos la más lógica (la primera disponible)
        if (!selectedRound) {
            const allRounds = [...new Set(filteredMatches.map(m => m.jornada))].sort((a, b) => Number(a) - Number(b));
            selectedRound = isFinished ? allRounds[allRounds.length - 1] : allRounds[0];
        }

        const roundMatches = filteredMatches.filter(m => m.jornada == selectedRound);

        // Agrupar visualmente
        const roundTitle = document.createElement('h3');
        roundTitle.className = 'modal-subtitle';
        roundTitle.style.marginTop = '1rem';
        roundTitle.style.marginBottom = '1.5rem';
        roundTitle.textContent = `Resultados de la Jornada ${selectedRound}`;
        container.appendChild(roundTitle);

        const grid = document.createElement('div');
        grid.className = 'matches-grid';
        
        roundMatches.forEach(match => {
            const home = teams.find(t => t.id == match.home_team_id) || { Equipo: '?', logo: 'premier_junior.jpg' };
            const away = teams.find(t => t.id == match.away_team_id) || { Equipo: '?', logo: 'premier_junior.jpg' };

            const homeLogo = home.logo || 'premier_junior.jpg';
            const awayLogo = away.logo || 'premier_junior.jpg';

            const scoreHTML = isFinished
                ? `<span class="score">${match.home_score}</span> <span class="score-vs">-</span> <span class="score">${match.away_score}</span>`
                : `<span class="score-vs">${match.date.split(' ')[1] || 'VS'}</span>`;

            const card = document.createElement('div');
            card.className = 'match-card';
            card.innerHTML = `
                <span class="match-date">${match.date.split(' ')[0]}</span>
                <div class="match-teams">
                    <div class="team">
                        <img src="${homeLogo}" alt="" class="team-logo-large" onerror="this.src='premier_junior.jpg'">
                        <span>${home.Equipo || home.name}</span>
                    </div>
                    ${scoreHTML}
                    <div class="team">
                        <img src="${awayLogo}" alt="" class="team-logo-large" onerror="this.src='premier_junior.jpg'">
                        <span>${away.Equipo || away.name}</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
        container.appendChild(grid);
    }

    // Configurar los selectores de jornadas
    function setupRoundSelectors() {
        const fixtureSelect = document.getElementById('roundSelectFixtures');
        const resultsSelect = document.getElementById('roundSelectResults');

        const allRounds = [...new Set(matches.map(m => m.jornada))].sort((a, b) => Number(a) - Number(b));
        
        const populateSelect = (select, isFinishedDefault) => {
            if (!select) return;
            select.innerHTML = '';
            allRounds.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r;
                opt.textContent = `Jornada ${r}`;
                select.appendChild(opt);
            });

            // Seleccionar por defecto la más lógica
            const filtered = matches.filter(m => isFinishedDefault ? m.status === 'finalizado' : m.status !== 'finalizado');
            const relRounds = [...new Set(filtered.map(m => m.jornada))].sort((a, b) => Number(a) - Number(b));
            if (relRounds.length > 0) {
                select.value = isFinishedDefault ? relRounds[relRounds.length - 1] : relRounds[0];
            }

            select.onchange = () => {
                const isFinished = select.id.includes('Results');
                renderMatches(isFinished ? 'results-container' : 'fixtures-container', isFinished, select.value);
            };
        };

        populateSelect(fixtureSelect, false);
        populateSelect(resultsSelect, true);
    }

    function renderAll() {
        const standings = calculateStandings();
        renderStandings(standings);
        setupRoundSelectors(); // Configura los dropdowns
        
        const fixtureSelect = document.getElementById('roundSelectFixtures');
        const resultsSelect = document.getElementById('roundSelectResults');
        
        renderMatches('fixtures-container', false, fixtureSelect ? fixtureSelect.value : null);
        renderMatches('results-container', true, resultsSelect ? resultsSelect.value : null);
    }

    // Lógica del Modal
    const modal = document.getElementById('teamModal');
    const closeBtn = document.getElementById('closeModal');

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

    window.openTeamModal = (teamId) => {
        const team = teams.find(t => t.id == teamId);
        if (!team) return;

        document.getElementById('modalTeamName').textContent = team.Equipo || team.name;
        document.getElementById('modalTeamLogo').src = team.logo || 'premier_junior.jpg';

        const teamMatches = matches.filter(m => m.home_team_id == teamId || m.away_team_id == teamId);

        const renderModalCards = (containerId, isFinished) => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            const filtered = teamMatches.filter(m => isFinished ? m.status === 'finalizado' : m.status !== 'finalizado');

            if (filtered.length === 0) {
                container.innerHTML = `<p style="color: var(--text-muted);">No hay partidos.</p>`;
                return;
            }

            filtered.forEach(match => {
                const home = teams.find(t => t.id == match.home_team_id) || { Equipo: '?', logo: 'premier_junior.jpg' };
                const away = teams.find(t => t.id == match.away_team_id) || { Equipo: '?', logo: 'premier_junior.jpg' };
                const scoreHTML = isFinished
                    ? `<span class="score" style="font-size:1.2rem; padding:0.2rem 0.5rem;">${match.home_score}</span> - <span class="score" style="font-size:1.2rem; padding:0.2rem 0.5rem;">${match.away_score}</span>`
                    : `<span class="score-vs">VS</span>`;

                const card = document.createElement('div');
                card.className = 'match-card';
                card.style.padding = '1rem';
                card.innerHTML = `
                    <span class="match-date" style="font-size:0.75rem; margin-bottom:0.8rem;">${match.date}</span>
                    <div class="match-teams">
                        <div class="team" style="font-size:0.9rem; gap:5px;">
                            <img src="${home.logo || 'premier_junior.jpg'}" alt="" class="team-logo-small" onerror="this.src='premier_junior.jpg'">
                            <span>${home.Equipo || home.name}</span>
                        </div>
                        ${scoreHTML}
                        <div class="team" style="font-size:0.9rem; gap:5px;">
                            <img src="${away.logo || 'premier_junior.jpg'}" alt="" class="team-logo-small" onerror="this.src='premier_junior.jpg'">
                            <span>${away.Equipo || away.name}</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        };

        renderModalCards('modal-finished-matches', true);
        renderModalCards('modal-scheduled-matches', false);

        modal.style.display = "block";
    };

    // 6. Exportar de forma completamente dinámica
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const standings = calculateStandings();
            if (standings.length === 0) return;

            let csvContent = "\uFEFF";

            // Ocultar las mismas columnas que en la vista
            const hiddenCols = ['id', 'logo', 'active'];
            const keys = Object.keys(standings[0]);
            const exportKeys = keys.filter(k => !hiddenCols.includes(k));

            // Escribir cabeceras en CSV (Usamos punto y coma para Excel Español)
            csvContent += "Posición;" + exportKeys.join(";") + "\n";

            // Escribir filas en CSV
            standings.forEach((t, i) => {
                let row = [i + 1];
                exportKeys.forEach(k => {
                    // Si el campo tuviese punto y coma, deberíamos envolverlo en comillas
                    let valor = t[k] ? t[k].toString().replace(/"/g, '""') : '';
                    if (valor.includes(';') || valor.includes(',')) {
                        valor = `"${valor}"`;
                    }
                    row.push(valor);
                });
                csvContent += row.join(";") + "\n";
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "Tabla_Posiciones.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    loadDataFromDB();
});
