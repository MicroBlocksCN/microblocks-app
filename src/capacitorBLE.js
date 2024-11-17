// TODO: implement in microblocks-app repo instead
// capacitorBLE.js
import { BleClient } from "@capacitor-community/bluetooth-le";
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
            await this.bleClient.connect(this.device.deviceId);

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

    async write_data(data) {
        if (!this.device || !this.connected) return 0;
        if (this.sendInProgress) return 0;

        try {
            this.sendInProgress = true;

            // Split data into chunks if needed
            for (let i = 0; i < data.length; i += BLE_PACKET_LEN) {
                const chunk = data.slice(i, Math.min(i + BLE_PACKET_LEN, data.length));
                await this.bleClient.write(
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
