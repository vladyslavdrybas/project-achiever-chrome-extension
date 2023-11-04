import {ApiRequestError, ApiRequestStatus, PostRequest} from "../ApiRequest";
import {Routes} from "@/artifacts/Route";
import LocalStorage from "@/util/LocalStorage";

type TLogoutResponse = {
    message: string;
}

class LogoutRequest {
    _host: string;
    _route: string;
    _response: TLogoutResponse | null;
    _storage: LocalStorage;

    constructor() {
        this._host = Routes.host;
        this._route = Routes.logout;
        this._route = this._host + this._route;
        this._response = null;
        this._storage = new LocalStorage();
    }

    get response(): TLogoutResponse|null
    {
        return this._response;
    }

    send = async (): Promise<void> => {
        const refreshToken = await this._storage.getRefreshToken();

        console.log(refreshToken);
        if (null === refreshToken) {
        await this._storage.clean();

        throw new ApiRequestError(
          {
            message: "Refreshing. Refresh token is not set.",
            status: ApiRequestStatus.HTTP_UNAUTHORIZED,
            route: this._route,
          }
        )
        }

        const request = new PostRequest(
        this._route,
        JSON.stringify({
          "refresh_token": refreshToken,
        })
        );

        await request.sendWithAuthorization();
        await this._storage.clean();

        this._response = request.response;
    }
}

export default LogoutRequest;
