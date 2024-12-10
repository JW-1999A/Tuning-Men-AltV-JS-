import * as alt from 'alt-server';

class TuningSystem {
    constructor() {
        this.registerEvents();
    }

    registerEvents() {
        alt.onClient('tuning:applyMod', this.handleTuningMod.bind(this));
    }

    handleTuningMod(player, vehicle, category, modIndex, level, color) {
        if (!player.vehicle || player.vehicle !== vehicle) {
            return;
        }

        this.applyVehicleMod(vehicle, category, modIndex, level, color);
        alt.emitClient(player, 'tuning:success', 'Modifikation erfolgreich');
    }

    getVehicleModCount(vehicle, modType) {
        return vehicle.getModsCount(modType);
    }

    convertColor(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b };
    }

    applyVehicleMod(vehicle, category, modIndex, level, color) {
        console.log('Wende Tuning an:', category, modIndex, level, color);
        
        if (!vehicle.modKitsCount) return;
        vehicle.modKit = 1;
        
        switch(category) {
            case 'performance':
                if (modIndex === 'engine' && level < this.getVehicleModCount(vehicle, 11)) 
                    vehicle.setMod(11, level);
                if (modIndex === 'brakes' && level < this.getVehicleModCount(vehicle, 12)) 
                    vehicle.setMod(12, level);
                if (modIndex === 'transmission' && level < this.getVehicleModCount(vehicle, 13)) 
                    vehicle.setMod(13, level);
                if (modIndex === 'turbo') 
                    vehicle.setMod(18, 0);
                break;

            case 'visual':
                if (modIndex === 'spoiler' && level < this.getVehicleModCount(vehicle, 0)) 
                    vehicle.setMod(0, level);
                if (modIndex === 'bumper' && level < this.getVehicleModCount(vehicle, 1)) 
                    vehicle.setMod(1, level);
                if (modIndex === 'skirts' && level < this.getVehicleModCount(vehicle, 3)) 
                    vehicle.setMod(3, level);
                if (modIndex === 'exhaust' && level < this.getVehicleModCount(vehicle, 4)) 
                    vehicle.setMod(4, level);
                break;

            case 'paint':
                const rgbColor = this.convertColor(color);
                if (modIndex === 'primary') vehicle.customPrimaryColor = rgbColor;
                if (modIndex === 'secondary') vehicle.customSecondaryColor = rgbColor;
                if (modIndex === 'pearlescent') vehicle.pearlColor = parseInt(color.replace('#', ''), 16);
                if (modIndex === 'wheels') vehicle.wheelColor = parseInt(color.replace('#', ''), 16);
                break;

            case 'wheels':
                const wheelTypes = {
                    'sport': 0,
                    'muscle': 1,
                    'lowrider': 2,
                    'suv': 3,
                    'offroad': 4,
                    'tuner': 5,
                    'highend': 7
                };
                
                if (wheelTypes.hasOwnProperty(modIndex)) {
                    vehicle.setWheels(wheelTypes[modIndex], level);
                }
                
                if (color) {
                    const colorValue = parseInt(color.replace('#', ''), 16);
                    vehicle.wheelColor = colorValue;
                }
                break;

            case 'special':
                if (modIndex === 'neon') {
                    vehicle.neonEnabled = true;
                    if (color) {
                        const rgb = this.convertColor(color);
                        vehicle.neonColor = rgb;
                    }
                }
                if (modIndex === 'xenon') {
                    vehicle.setMod(22, 0);
                    if (color) {
                        vehicle.headlightColor = this.getHeadlightColorIndex(color);
                    }
                }
                if (modIndex === 'windowTint') {
                    vehicle.windowTint = level;
                }
                if (modIndex === 'livery' && level < this.getVehicleModCount(vehicle, 48)) {
                    vehicle.setMod(48, level);
                }
                break;
        }
    }

    getHeadlightColorIndex(color) {
        const colors = {
            '#FFFFFF': 0,  // Default
            '#0000FF': 1,  // Blue
            '#00FF00': 2,  // Green
            '#FF0000': 3,  // Red
            '#FFFF00': 4,  // Yellow
            '#FFA500': 5,  // Orange
            '#FF69B4': 6,  // Pink
            '#800080': 7   // Purple
        };
        return colors[color.toUpperCase()] || 0;
    }
}

const tuningSystem = new TuningSystem();
export default tuningSystem;
