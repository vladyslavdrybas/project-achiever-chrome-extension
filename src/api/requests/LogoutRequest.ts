import {GetRequest} from "../ApiRequest";
import {StorageKeys} from "../../types/StorageKeys";
import {Routes} from "../../artifacts/Route";

type TLogoutResponse = {
    message: string;
}

class LogoutRequest {
    _host: string;
    _route: string;
    _response: TLogoutResponse | null;

    constructor() {
        this._host = Routes.host;
        this._route = Routes.logout;
        this._route = this._host + this._route;
        this._response = null;
    }

    get response(): TLogoutResponse|null
    {
        return this._response;
    }

    send = async (): Promise<void> => {
        const request = new GetRequest(this._route);

        await request.send();
        await chrome.storage.local.remove([StorageKeys.LOGGED_USER_ID, StorageKeys.ACCESS_TOKEN, StorageKeys.REFRESH_TOKEN]);

        this._response = request.response;
    }
}

export default LogoutRequest;
