let currentCategory = null;
let currentStats = null;
let currentLevels = {};

document.addEventListener('DOMContentLoaded', () => {
    setupCategoryListeners();
    updateClock();
    setInterval(updateClock, 1000);
});

function setupCategoryListeners() {
    document.querySelectorAll('.category').forEach(category => {
        category.addEventListener('click', () => {
            selectCategory(category.dataset.category);
        });
    });
}

function selectCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    loadTuningOptions(category);
}

function loadTuningOptions(category) {
    const optionsContainer = document.querySelector('.tuning-options');
    optionsContainer.innerHTML = '';

    const options = {
        performance: [
            { id: 'engine', name: 'Motor', levels: 4 },
            { id: 'turbo', name: 'Turbo', levels: 1 },
            { id: 'brakes', name: 'Bremsen', levels: 3 },
            { id: 'transmission', name: 'Getriebe', levels: 3 }
        ],
        visual: [
            { id: 'spoiler', name: 'Spoiler', levels: 5 },
            { id: 'bumper', name: 'Stoßstange', levels: 3 },
            { id: 'skirts', name: 'Seitenschweller', levels: 3 },
            { id: 'exhaust', name: 'Auspuff', levels: 4 }
        ],
        wheels: [
            { id: 'sport', name: 'Sport', levels: 20, hasColor: true },
            { id: 'muscle', name: 'Muscle', levels: 20, hasColor: true },
            { id: 'lowrider', name: 'Lowrider', levels: 20, hasColor: true },
            { id: 'suv', name: 'SUV', levels: 20, hasColor: true },
            { id: 'offroad', name: 'Offroad', levels: 20, hasColor: true },
            { id: 'tuner', name: 'Tuner', levels: 20, hasColor: true },
            { id: 'highend', name: 'Highend', levels: 20, hasColor: true }
        ],
        paint: [
            { id: 'primary', name: 'Hauptfarbe', colors: true },
            { id: 'secondary', name: 'Zweitfarbe', colors: true },
            { id: 'pearlescent', name: 'Perleffekt', colors: true }
        ],
        special: [
            { id: 'neon', name: 'Neon', hasColor: true, toggle: true },
            { id: 'xenon', name: 'Xenon', hasColor: true, toggle: true },
            { id: 'windowTint', name: 'Scheibentönung', levels: 6 },
            { id: 'livery', name: 'Folierung', levels: 12 }
        ]
    };

    options[category]?.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'tuning-option';
        optionEl.dataset.option = option.id;
        
        let html = `<div class="option-header"><span>${option.name}</span>`;

        if (option.toggle) {
            html += `
                <div class="option-controls">
                    <button class="toggle-btn" onclick="applyTuning('${category}', '${option.id}', 1)">Aktivieren</button>
                    ${option.hasColor ? `<input type="color" onchange="applyTuning('${category}', '${option.id}', 1, this.value)">` : ''}
                </div>`;
        } else if (option.hasColor || option.levels) {
            if (!currentLevels[option.id]) currentLevels[option.id] = 0;
            html += `
                <div class="option-controls">
                    <button class="arrow-btn" onclick="changeTuningLevel('${category}', '${option.id}', 'prev')">←</button>
                    <span class="level-display">1/${option.levels || 1}</span>
                    <button class="arrow-btn" onclick="changeTuningLevel('${category}', '${option.id}', 'next')">→</button>
                    ${option.hasColor ? `<input type="color" onchange="applyTuning('${category}', '${option.id}', currentLevels['${option.id}'], this.value)">` : ''}
                </div>`;
        } else if (option.colors) {
            html += `
                <div class="color-picker">
                    <input type="color" onchange="applyTuning('${category}', '${option.id}', 0, this.value)">
                </div>`;
        }

        html += '</div>';
        optionEl.innerHTML = html;
        optionsContainer.appendChild(optionEl);
    });
}

function changeTuningLevel(category, optionId, direction) {
    const option = document.querySelector(`[data-option="${optionId}"]`);
    const maxLevel = parseInt(option.querySelector('.level-display').textContent.split('/')[1]) - 1;
    
    if (direction === 'next') {
        currentLevels[optionId] = currentLevels[optionId] >= maxLevel ? 0 : currentLevels[optionId] + 1;
    } else {
        currentLevels[optionId] = currentLevels[optionId] <= 0 ? maxLevel : currentLevels[optionId] - 1;
    }

    // Update display
    const levelDisplay = option.querySelector('.level-display');
    levelDisplay.textContent = `${currentLevels[optionId] + 1}/${maxLevel + 1}`;

    // Apply tuning
    applyTuning(category, optionId, currentLevels[optionId]);
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    document.querySelector('.time').textContent = timeString;
}

function showNotification(type, message) {
    const notificationContainer = document.createElement('div');
    notificationContainer.className = `notification ${type}`;
    notificationContainer.innerHTML = `
        <div class="notification-icon">${type === 'success' ? '✓' : '✗'}</div>
        <div class="notification-message">${message}</div>
    `;

    document.body.appendChild(notificationContainer);

    setTimeout(() => {
        notificationContainer.classList.add('show');
    }, 100);

    setTimeout(() => {
        notificationContainer.classList.remove('show');
        setTimeout(() => {
            notificationContainer.remove();
        }, 300);
    }, 3000);
}

function applyTuning(category, optionId, level, color) {
    console.log('Sende Tuning-Request:', category, optionId, level, color);
    if (typeof alt !== 'undefined') {
        alt.emit('tuning:apply', category, optionId, level, color);
    }
}

alt.on('vehicle:updateStats', (stats) => {
    currentStats = stats;
    updateStatsDisplay();
});

function updateStatsDisplay() {
    if (!currentStats) return;
    
    document.querySelectorAll('.stat-fill').forEach((statBar, index) => {
        const values = [
            currentStats.power / 4 * 100,
            currentStats.handling * 100,
            currentStats.brakes / 2 * 100
        ];
        statBar.style.width = `${values[index]}%`;
    });
}

alt.on('tuning:notification', (data) => {
    showNotification(data.type, data.message);
});

alt.on('tablet:show', () => {
    document.body.style.display = 'flex';
});

alt.on('tablet:hide', () => {
    document.body.style.display = 'none';
});
