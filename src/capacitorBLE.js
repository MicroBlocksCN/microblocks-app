// TODO: implement in microblocks-app repo instead
// capacitorBLE.js
import { BleClient } from "@capacitor-community/bluetooth-le";

const MICROBLOCKS_SERVICE_UUID = 'bb37a001-b922-4018-8e74-e14824b3a638'
const MICROBLOCKS_RX_CHAR_UUID = 'bb37a002-b922-4018-8e74-e14824b3a638' // board receive characteristic
const MICROBLOCKS_TX_CHAR_UUID = 'bb37a003-b922-4018-8e74-e14824b3a638' // board transmit characteristic

class CapacitorBLESerial {
    constructor() {
        this.device = null;
        this.connected = false;
        this.sendInProgress = false;
        this.bleClient = null;
    }

    async initialize() {
        // Get BleClient from Capacitor
        this.bleClient = BleClient;
        await this.bleClient.initialize();
    }

    async connect() {
        try {
            if (!this.bleClient) await this.initialize();

            // Request device
            this.device = await this.bleClient.requestDevice({
                services: [MICROBLOCKS_SERVICE_UUID],
            });

            // Connect to device
            await this.bleClient.connect(this.device.deviceId , (deviceId) => {
                // disconnect callback
                console.log("Disconnected from device: " + deviceId);
                this.disconnect();
            });

            // Start notifications
            await this.bleClient.startNotifications(
                this.device.deviceId,
                MICROBLOCKS_SERVICE_UUID,
                MICROBLOCKS_TX_CHAR_UUID,
                (data) => {
                    const value = new Uint8Array(data.buffer);
                    GP_serialInputBuffers.push(value);
                }
            );

            this.connected = true;
            this.sendInProgress = false;
            console.log("Capacitor BLE connected");
        } catch (error) {
            console.error('BLE connection error:', error);
            this.disconnect();
        }
    }

    async disconnect() {
        if (this.device) {
            try {
                await this.bleClient.stopNotifications(
                    this.device.deviceId,
                    MICROBLOCKS_SERVICE_UUID,
                    MICROBLOCKS_TX_CHAR_UUID
                );
                await this.bleClient.disconnect(this.device.deviceId);
            } catch (error) {
                console.error('BLE disconnect error:', error);
            }
        }
        this.device = null;
        this.connected = false;
        this.sendInProgress = false;
    }

    isConnected() {
        return this.connected;
    }

    write_data(data) {
        if (!this.device || !this.connected) return 0;
        if (this.sendInProgress) return 0;

        try {
            this.sendInProgress = true;

            // Split data into chunks if needed
            for (let i = 0; i < data.length; i += BLE_PACKET_LEN) {
                const chunk = data.slice(i, Math.min(i + BLE_PACKET_LEN, data.length));
                this.bleClient.writeWithoutResponse(
                    this.device.deviceId,
                    MICROBLOCKS_SERVICE_UUID,
                    MICROBLOCKS_RX_CHAR_UUID,
                    chunk
                );
            }

            this.sendInProgress = false;
            return data.length;
        } catch (error) {
            console.error('BLE write error:', error);
            this.sendInProgress = false;
            if (!this.isConnected()) {
                this.disconnect();
            }
            return 0;
        }
    }
}
window.CapacitorBLESerial = CapacitorBLESerial;
