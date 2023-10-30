import {PostRequest} from "../ApiRequest";
import {Routes} from "../../artifacts/Route";

type TRegisterResponse = {
    message: string;
}

class RegisterRequest {
    _host: string;
    _email: string;
    _password: string;
    _route: string;
    _response: TRegisterResponse | null;

    constructor(email: string, password: string) {
        this._host = Routes.host;
        this._route = Routes.register;
        this._route = this._host + this._route;
        this._response = null;
        this._email = email;
        this._password = password;
    }

    get response(): TRegisterResponse|null
    {
        return this._response;
    }

    send = async (): Promise<void> => {
        const request = new PostRequest(
            this._route,
            JSON.stringify({
                "email": this._email,
                "password": this._password,
            })
        );

        await request.send();

        this._response = {
            message: request.response.message,
        };
    }
}

export default RegisterRequest;
