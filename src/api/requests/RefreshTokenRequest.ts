import {
    AccessTokenWriter,
    ApiRequestError,
    ApiRequestStatus,
    PostRequest
} from "../ApiRequest";
import ProfileRequest from "./ProfileRequest";
import {TLoginResponse} from "./LoginRequest";
import {StorageKeys} from "../../types/StorageKeys";
import {Routes} from "../../artifacts/Route";

class RefreshTokenRequest {
    _host: string;
    _route: string;
    _response: TLoginResponse | null;

    constructor() {
        this._host = Routes.host;
        this._route = Routes.refreshAccessToken;
        this._route = this._host + this._route;
        this._response = null;
    }

    get response(): TLoginResponse|null
    {
        return this._response;
    }

    send = async (): Promise<void> => {
        const refreshToken = (await chrome.storage.local.get([StorageKeys.REFRESH_TOKEN]))[StorageKeys.REFRESH_TOKEN] ?? null;

        console.log(refreshToken);
        if (null === refreshToken) {
           await chrome.storage.local.remove([StorageKeys.LOGGED_USER_ID, StorageKeys.ACCESS_TOKEN, StorageKeys.REFRESH_TOKEN]);

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

            request.accessToken();
        } catch (e) {
            console.log(e);
            console.log(request.status);
            if (request.status === ApiRequestStatus.HTTP_UNAUTHORIZED) {
                console.log('clean local storage');
                await chrome.storage.local.remove([StorageKeys.LOGGED_USER_ID, StorageKeys.ACCESS_TOKEN, StorageKeys.REFRESH_TOKEN]);
            }

            throw e;
        }

        request.accessToken();

        const userId = (await chrome.storage.local.get([StorageKeys.LOGGED_USER_ID]))[StorageKeys.LOGGED_USER_ID] ?? null;

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
