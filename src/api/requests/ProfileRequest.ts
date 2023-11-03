import {GetRequest} from "../ApiRequest";
import DateW3c from "../../util/DateW3c";
import {StorageKeys} from "@/types/StorageKeys";
import {Routes} from "@/artifacts/Route";

export type TProfileResponse = {
    email: string;
    locale: string;
    object: string;
    id: string;
    createdAt: DateW3c;
    updatedAt: DateW3c;
    isActive: boolean;
    isEmailVerified: boolean;
    isBanned: boolean;
    isDeleted: boolean;
}

class ProfileRequest {
    _host: string;
    _route: string;
    _response: TProfileResponse | null;

    constructor() {
        this._host = Routes.host;
        this._route = Routes.profile;
        this._route = this._host + this._route;
        this._response = null;
    }

    get response(): TProfileResponse|null
    {
        return this._response;
    }

    send = async (): Promise<void> => {
        const request = new GetRequest(this._route);

        await request.sendWithAuthorization();

        let response: any = request.response;

        response.createdAt = new DateW3c(response.createdAt);
        response.updatedAt = new DateW3c(response.updatedAt);

        const userObj: any = {};
        userObj[StorageKeys.LOGGED_USER_ID] = response.id;
        await chrome.storage.local.set(userObj);

        this._response = response;
    }
}

export default ProfileRequest;
