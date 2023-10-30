import {GetRequest} from "../ApiRequest";
import {Routes} from "../../artifacts/Route";

type TFcmTokenRegisterResponse = {
    message: string;
}

class FcmTokenRegister {
    _host: string;
    _route: string;
    _response: TFcmTokenRegisterResponse | null;

    constructor(
        token: string,
    ) {
        this._host = Routes.host;
        this._route = Routes.fcmTokenRegister;
        this._route = this._host + this._route;
        this._route = this._route.replace('{{token}}', token);
        this._response = null;
    }

    get response(): TFcmTokenRegisterResponse|null
    {
        return this._response;
    }

    send = async (): Promise<void> => {
        const request = new GetRequest(this._route);

        await request.sendWithAuthorization();

        this._response = request.response;
    }
}

export default FcmTokenRegister;
