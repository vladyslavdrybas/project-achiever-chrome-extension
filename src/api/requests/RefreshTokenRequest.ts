import {
    AccessTokenWriter,
    ApiRequestError,
    ApiRequestStatus,
    PostRequest
} from "../ApiRequest";
import ProfileRequest from "./ProfileRequest";
import {TLoginResponse} from "./LoginRequest";
import {Routes} from "@/artifacts/Route";
import LocalStorage from "@/util/LocalStorage";

class RefreshTokenRequest {
    _host: string;
    _route: string;
    _response: TLoginResponse | null;
    _storage: LocalStorage;

    constructor() {
        this._host = Routes.host;
        this._route = Routes.refreshAccessToken;
        this._route = this._host + this._route;
        this._response = null;
        this._storage = new LocalStorage();
    }

    get response(): TLoginResponse|null
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

        try {
            (new AccessTokenWriter()).decorate(request);

            await request.send();
            console.log(request.response);

            await request.accessToken();
        } catch (e) {
            console.log(e);
            console.log(request.status);
            if (request.status === ApiRequestStatus.HTTP_UNAUTHORIZED) {
                console.log('clean local storage');
                await this._storage.clean();
            }

            throw e;
        }

        await request.accessToken();

        const userId = await this._storage.getLoggedUserId();

        if (null === userId) {
            const getProfileRequest = new ProfileRequest();
            await getProfileRequest.send();
        }

        this._response = {
            accessToken: request.response.token,
            refreshToken: request.response.refresh_token,
        };
    }
}

export default RefreshTokenRequest;
