import * as alt from 'alt-client';
import * as native from 'natives';

console.log('[TUNER] Client Script startet');

const webview = new alt.WebView('http://resource/client/ui.html');
let isInventoryOpen = false;

alt.on('keyup', (key) => {
    if (key === 114) { // F2
        toggleInventory();
    }
});

function toggleInventory() {
    isInventoryOpen = !isInventoryOpen;
    console.log('Tuner Status:', isInventoryOpen);

    if (isInventoryOpen) {
        webview.focus();
        webview.emit('tablet:show');
        alt.showCursor(true);
        alt.toggleGameControls(false);
        updateVehicleStats();
    } else {
        webview.unfocus();
        webview.emit('tablet:hide');
        alt.showCursor(false);
        alt.toggleGameControls(true);
    }
}

function updateVehicleStats() {
    const vehicle = alt.Player.local.vehicle;
    if (!vehicle) return;

    const stats = {
        power: native.getVehicleMod(vehicle.scriptID, 11),
        handling: native.getVehicleMaxTraction(vehicle.scriptID),
        brakes: native.getVehicleMod(vehicle.scriptID, 12)
    };

    webview.emit('vehicle:updateStats', stats);
}

webview.on('tuning:apply', (category, optionId, level) => {
    console.log('Tuning-Request empfangen:', category, optionId, level);
    const vehicle = alt.Player.local.vehicle;
    if (!vehicle) return;

    alt.emitServer('tuning:applyMod', vehicle, category, optionId, level);
});

alt.onServer('tuning:success', (message) => {
    webview.emit('tuning:notification', {
        type: 'success',
        message: message
    });
    updateVehicleStats();
});

alt.onServer('tuning:error', (message) => {
    webview.emit('tuning:notification', {
        type: 'error',
        message: message
    });
});
