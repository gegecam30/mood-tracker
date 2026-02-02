// 1. Selección de elementos
const slider = document.getElementById('mood-slider');
const video = document.getElementById('mood-video');
const revealArea = document.getElementById('reveal-area');
const message = document.getElementById('mood-message');
const saveBtn = document.getElementById('save-btn');

// Elementos para ocultar con suavidad
const header = document.querySelector('header');
const sliderSection = document.querySelector('.slider-container');
const footer = document.querySelector('footer');

// 2. Pre-carga de sonidos
// Asegúrate de tener pop.mp3 y success.mp3 en assets/sounds/
const soundPop = new Audio('assets/sounds/pop.ogg');
const soundSuccess = new Audio('assets/sounds/success.ogg');

// 3. Configuración de videos y mensajes
const moodData = {
    low: { vid: 'assets/videos/mal.mp4', label: 'Mal', text: 'Hey, no pasa nada, todavia quedan mas dias :D' },
    mid: { vid: 'assets/videos/normal.mp4', label: 'Meh', text: 'Un día tranquilo. algo normal' },
    high: { vid: 'assets/videos/bien.mp4', label: 'Súper', text: 'Bieeen! que gusto! ' }
};

// 4. Variables de control para el sonido de la barra
let lastMood = 'mid'; // Para saber si cambiamos de rango y sonar

// 5. EVENTO: Movimiento de la barra (Sonido Pop)
slider.addEventListener('input', () => {
    const val = slider.value;
    let currentMood;

    if (val < 35) currentMood = 'low';
    else if (val < 75) currentMood = 'mid';
    else currentMood = 'high';

    // Si el usuario cambia de zona (ej: de mal a meh), suena el pop
    if (currentMood !== lastMood) {
        soundPop.currentTime = 0; // Reinicia el sonido para que suene rápido
        soundPop.play().catch(e => console.log("Interacción necesaria para audio"));
        lastMood = currentMood;
    }
});

// 6. EVENTO: Confirmar (Funde y Video)
saveBtn.addEventListener('click', () => {
    const val = slider.value;
    let selected;

    if (val < 35) selected = moodData.low;
    else if (val < 75) selected = moodData.mid;
    else selected = moodData.high;

    // A. Guardar en Firebase (GeXel Cloud)
    enviarAFirebase(selected.label);

    // B. Sonido de confirmación
    soundSuccess.play();

    // C. Fase de desvanecimiento (Fade Out)
    [header, sliderSection, footer].forEach(el => el.classList.add('fade-out'));

    // Esperamos el tiempo del CSS (0.5s)
    setTimeout(() => {
        // Limpieza de pantalla
        header.style.display = 'none';
        sliderSection.style.display = 'none';
        footer.style.display = 'none';

        // Preparar video
        revealArea.style.display = 'block';
        video.src = selected.vid;
        video.load();
        message.innerText = selected.text;

        // D. Aparecer suavemente (Fade In)
        setTimeout(() => {
            revealArea.classList.add('fade-in');
            video.play();
            
            // Si es súper, lanzamos confeti morado
            if (selected.label === 'Súper') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#8c0cde', '#ff00ff', '#ffffff']
                });
            }
        }, 50);
    }, 500);
});

// 7. Lógica de Firebase
function enviarAFirebase(label) {
    const now = new Date();
    database.ref('logs').push({
        day: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][now.getDay()],
        date: now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        status: label,
        timestamp: Date.now()
    });
}

// 8. Historial compartido (en tiempo real)
const historyList = document.getElementById('history-list');
database.ref('logs').limitToLast(10).on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        historyList.innerHTML = ''; 
        Object.values(data).reverse().forEach(log => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `<span>${log.day} (${log.date})</span><span class="mood-tag">${log.status}</span>`;
            historyList.appendChild(item);
        });
    }
});