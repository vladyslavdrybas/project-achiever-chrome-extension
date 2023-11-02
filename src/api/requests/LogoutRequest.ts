import {ApiRequestError, ApiRequestStatus, PostRequest} from "../ApiRequest";
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

      await request.sendWithAuthorization();
      await chrome.storage.local.remove([
        StorageKeys.LOGGED_USER_ID,
        StorageKeys.ACCESS_TOKEN,
        StorageKeys.REFRESH_TOKEN,
        StorageKeys.FCM_TOKEN_EXPIRE_AT_UTC,
      ]);

      this._response = request.response;
    }
}

export default LogoutRequest;
