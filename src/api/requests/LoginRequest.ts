import {AccessTokenWriter, PostRequest} from "../ApiRequest";
import ProfileRequest from "./ProfileRequest";
import {Routes} from "../../artifacts/Route";

export type TLoginResponse = {
    accessToken: string;
    refreshToken: string;
}

class LoginRequest {
    _host: string;
    _email: string;
    _password: string;
    _route: string;
    _response: TLoginResponse | null;

    constructor(email: string, password: string) {
        this._host = Routes.host;
        this._route = Routes.login;
        this._route = this._host + this._route;
        this._response = null;
        this._email = email;
        this._password = password;
    }

    get response(): TLoginResponse|null
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

        (new AccessTokenWriter()).decorate(request);

        await request.send();
        request.accessToken();

        const getProfileRequest = new ProfileRequest();
        await getProfileRequest.send();

        this._response = {
            accessToken: request.response.token,
            refreshToken: request.response.refresh_token,
        };
    }
}

export default LoginRequest;
