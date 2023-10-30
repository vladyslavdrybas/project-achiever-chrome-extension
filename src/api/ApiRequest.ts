import {StorageKeys} from "../types/StorageKeys";
import RefreshTokenRequest from "./requests/RefreshTokenRequest";
import {jwt_decode} from "../util/Jwt";

enum ApiRequestMethods {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Delete = "DELETE",
}

export enum ApiRequestStatus {
    HTTP_UNAUTHORIZED = 401,
    HTTP_NOT_FOUND = 405,
}

interface IApiRequest {
    route: string;
    method: ApiRequestMethods;
    headers: Record<string, string>;
    body: string;
    response: any;
    accessToken(): Promise<string>;
    refreshTokenIfExpired(): Promise<void>;
    send(): Promise<any>;
    sendWithAuthorization(): Promise<any>;
    addHeader(header: IHeaderKeyPair): Record<string, string>;
    addAuthorizationHeader(): Promise<void>;
    removeHeader(key: string): Record<string, string>;
    setMethod(value: ApiRequestMethods): void;
    isStatusOk(): boolean;
}

interface IHeaderKeyPair {
    key: string;
    value: string;
}

type TApiRequestErrorInput = {
    message: string;
    status: number;
    route?: string;
}

export class ApiRequestError extends Error {
    _status: number;
    _route: string;

    constructor(body: TApiRequestErrorInput) {
        super(body.message);

        this._status = body.status;
        this._route = body.route ?? '';
    }

    get status(): number
    {
        return this._status;
    }

    get route(): string
    {
        return this._route;
    }

    toString = (): string => {
        return this.message;
    }
}

class ApiRequest {
    _headers: Record<string, string>;
    _route: string;
    _body: string;
    _status: number;
    _response: any;
    _method: ApiRequestMethods;

    constructor(
        route: string,
        body: string,
        mtd: ApiRequestMethods = ApiRequestMethods.Get
    ) {
        this._method = mtd;
        this._route = route;
        this._body = body;
        this._status = 404;
        this._headers = {};
        this._response = null;
        this.addHeader({key: "Content-Type", value: "application/json"});
        this.addHeader({key: "Access-Control-Allow-Origin", value: "*"});
        this.addHeader({key: "ngrok-skip-browser-warning", value: "69420"});
    }

    get status(): number
    {
        return this._status;
    }

    get route(): string
    {
        return this._route;
    }

    get body(): string
    {
        return this._body;
    }

    get response(): any
    {
        return this._response;
    }

    get headers(): Record<string, string>
    {
        return this._headers;
    }

    get method(): ApiRequestMethods
    {
        return this._method;
    }

    accessToken = async (): Promise<string> => {
        throw new ApiRequestError(
            {
                message: "Access token required.",
                status: ApiRequestStatus.HTTP_UNAUTHORIZED,
                route: this.route,
            }
        )
    }

    addHeader = (header: IHeaderKeyPair): Record<string, string> => {
        this._headers[header.key] = header.value;
        return this._headers;
    }

    addAuthorizationHeader = async (): Promise<void> => {
        this.addHeader({key: "Authorization", value: "Bearer " + (await this.accessToken())});
    }

    removeHeader = (key: string): Record<string, string> => {
        delete this._headers[key];
        return this._headers;
    }

    setMethod = (value: ApiRequestMethods): void => {
        this._method = value;
    }

    isStatusOk = (): boolean => {
        return !(this.status < 200 || this.status > 299 || this.response === null);
    }

    refreshTokenIfExpired = async (): Promise<void> => {
        console.log(this.refreshTokenIfExpired.name);
        const refreshToken = (await chrome.storage.local.get([StorageKeys.REFRESH_TOKEN]))[StorageKeys.REFRESH_TOKEN] ?? null;

        console.log(refreshToken);
        if (null === refreshToken) {
            return;
        }

        const accessToken = (await chrome.storage.local.get([StorageKeys.ACCESS_TOKEN]))[StorageKeys.ACCESS_TOKEN] ?? '';
        const jwt = jwt_decode(accessToken);

        console.log(jwt);
        if (null === jwt) {
            console.log("Refreshing token");
            const request = new RefreshTokenRequest();
            await request.send();
        }
    }

    sendWithAuthorization = async (): Promise<any> => {
        await this.refreshTokenIfExpired();

        (new AccessTokenReader()).decorate(this);
        await this.addAuthorizationHeader();

        await this.send();
    }

    send = async (): Promise<any> => {
        if (this.route === '') {
            throw new ApiRequestError(
                {
                    message: "Cannot send to empty route.",
                    status: ApiRequestStatus.HTTP_NOT_FOUND,
                    route: this.route,
                }
            );
        }

        const init: any = {
            method: this.method,
            headers: this.headers,
        };

        if (this.method !== ApiRequestMethods.Get) {
            init.body = this.body;
        }

        console.log({
            requestHeaders: this.headers,
            requestRoute: this.route,
            requestBody: this.body,
            requestMethod: this.method,
        })

        const response = await fetch(this.route, init);

        if (response.headers.get("Content-type") === "application/json") {
            this._response = await response.json();

            console.log({
                status: response.status,
                body: this._response,
                responseHeaders: response.headers,
                requestHeaders: this.headers,
                requestRoute: this.route,
            })
        }
        this._status = response.status;

        if (!this.isStatusOk()) {
            console.log({
                status: response.status,
                body: response.body,
                responseHeaders: response.headers,
                requestHeaders: this.headers,
                requestRoute: this.route,
            })

            throw new ApiRequestError(
                {
                    message: this.response?.message ?? "Request failed.",
                    status: response.status,
                    route: this.route,
                }
            );
        }

        return this.response;
    }
}

interface IRequestDecorator {
    decorate(request: IApiRequest): void;
}

interface IAccessTokenReader {}
class AccessTokenReader implements IRequestDecorator, IAccessTokenReader {
    constructor() {}
    decorate = (request: IApiRequest): void => {
        request.accessToken = async (): Promise<string> => {
            const accessToken = (await chrome.storage.local.get([StorageKeys.ACCESS_TOKEN]))[StorageKeys.ACCESS_TOKEN] ?? null;
            if (null === accessToken) {
                throw new ApiRequestError(
                    {
                        message: "Access token is not set.",
                        status: ApiRequestStatus.HTTP_UNAUTHORIZED,
                        route: request.route,
                    }
                )
            }

            return accessToken;
        };
    }
}

interface IAccessTokenWriter{}
class AccessTokenWriter implements IRequestDecorator, IAccessTokenWriter {
    constructor() {}
    decorate = (request: IApiRequest): void => {
        request.accessToken = async (): Promise<string> => {
            const response = request.response;

            if (!response.hasOwnProperty('token')) {
                throw new ApiRequestError(
                    {
                        message: "Access token is not received.",
                        status: ApiRequestStatus.HTTP_UNAUTHORIZED,
                        route: request.route,
                    }
                )
            }

            if (!response.hasOwnProperty('refresh_token')) {
                throw new ApiRequestError(
                    {
                        message: "Refresh token is not received.",
                        status: ApiRequestStatus.HTTP_UNAUTHORIZED,
                        route: request.route,
                    }
                )
            }

            const accessTokenObj: any = {};
            accessTokenObj[StorageKeys.ACCESS_TOKEN] = response.token;
            await chrome.storage.local.set(accessTokenObj);

            const refreshTokenObj: any = {};
            refreshTokenObj[StorageKeys.REFRESH_TOKEN] = response.refresh_token;
            await chrome.storage.local.set(refreshTokenObj);

            const accessToken = (await chrome.storage.local.get([StorageKeys.ACCESS_TOKEN]))[StorageKeys.ACCESS_TOKEN] ?? null;
            if (null === accessToken) {
                throw new ApiRequestError(
                    {
                        message: "Access token is not set.",
                        status: ApiRequestStatus.HTTP_UNAUTHORIZED,
                        route: request.route,
                    }
                )
            }

            return accessToken;
        }
    }
}

interface IGetRequest {}
class GetRequest extends ApiRequest implements IGetRequest {
    constructor(
        route: string
    ) {
        super(route, '', ApiRequestMethods.Get);
    }
}

interface IPostRequest {}
class PostRequest extends ApiRequest implements IPostRequest {
    constructor(
        route: string,
        body: string
    ) {
        super(route, body, ApiRequestMethods.Post);
    }
}

interface IPutRequest {}
class PutRequest extends ApiRequest implements IPutRequest {
    constructor(
        route: string,
        body: string
    ) {
        super(route, body, ApiRequestMethods.Put);
    }
}

interface IDeleteRequest {}
class DeleteRequest extends ApiRequest implements IDeleteRequest {
    constructor(
        route: string
    ) {
        super(route, '', ApiRequestMethods.Delete);
    }
}

export type {
    IRequestDecorator,
    IApiRequest,
}

export {
    AccessTokenReader,
    AccessTokenWriter,
    ApiRequest,
    GetRequest,
    PostRequest,
    PutRequest,
    DeleteRequest,
};
