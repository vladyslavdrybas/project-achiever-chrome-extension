import {GetRequest} from "../ApiRequest";
import {Routes} from "@/artifacts/Route";
import LocalStorage from "@/util/LocalStorage";

type TFcmTokenRegisterResponse = {
    deviceType: string;
    user: {
      id: string;
    };
    expireAt: string;
}

class FcmTokenRegister {
    _host: string;
    _route: string;
    _response: TFcmTokenRegisterResponse | null;
    _storage: LocalStorage;

    constructor(
        token: string,
    ) {
        this._host = Routes.host;
        this._route = Routes.fcmTokenRegister;
        this._route = this._host + this._route;
        this._route = this._route.replace('{{token}}', token);
        this._response = null;
        this._storage = new LocalStorage();
    }

    get response(): TFcmTokenRegisterResponse|null
    {
        return this._response;
    }

    send = async (): Promise<void> => {
        const request = new GetRequest(this._route);

        await request.sendWithAuthorization();

        this._response = request.response;

        const expiredAt = this._response?.expireAt ?? null;
        if (null !== expiredAt) {
            await this._storage.setFcmTokenExpireAtUtc(expiredAt);
        }
    }
}

export default FcmTokenRegister;
