import browser from 'webextension-polyfill'
import { StorageKeys } from "@/types/StorageKeys";

class LocalStorage {
    get = async (key: string): Promise<string|null> => {
        return Object.values(await browser.storage.local.get(key)).pop() ?? null;
    }

    set = async (key: string, value: string): Promise<void> => {
        await browser.storage.local.set({[key]:value});
    }

    getAllowedKeys = (): Array<string> => {
        return Object.values(StorageKeys);
    }

    getStoredValues = async () => {
        return await browser.storage.local.get();
    }

    getStoredKeys = async () => {
        return Object.keys(await this.getStoredValues());
    }

    log = async () => {
        const data = await this.getStoredValues();
        console.log(data);
    }

    clean = async () => {
        await browser.storage.local.remove(this.getAllowedKeys());

        await this.log();
    }

    setAccessToken = async (value: string) => {
        await this.set(StorageKeys.ACCESS_TOKEN, value);
    }

    getAccessToken = async (): Promise<string|null> => {
        return await this.get(StorageKeys.ACCESS_TOKEN);
    }

    setRefreshToken = async (value: string) => {
        await this.set(StorageKeys.REFRESH_TOKEN, value);
    }

    getRefreshToken = async (): Promise<string|null> => {
        return await this.get(StorageKeys.REFRESH_TOKEN);
    }

    setLoggedUserId = async (value: string) => {
        await this.set(StorageKeys.LOGGED_USER_ID, value);
    }

    getLoggedUserId = async (): Promise<string|null> => {
        return await this.get(StorageKeys.LOGGED_USER_ID);
    }

    setFcmTokenExpireAtUtc = async (value: string) => {
        await this.set(StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC, value);
    }

    getFcmTokenExpireAtUtc = async (): Promise<string|null> => {
        return await this.get(StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC);
    }
}

export default LocalStorage;