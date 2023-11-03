import {PostRequest} from "../ApiRequest";
import {Routes} from "@/artifacts/Route";

type TAnalyticsTrackNotificationRequestResponse = {
    message: string;
}

class AnalyticsTrackNotificationRequest {
    _host: string;
    _route: string;
    _body: any;
    _response: TAnalyticsTrackNotificationRequestResponse | null;

    constructor(body: any) {
        this._host = Routes.host;
        this._route = Routes.analyticsTrackNotification;
        this._route = this._host + this._route;
        this._response = null;
        this._body = body;
    }

    get response(): TAnalyticsTrackNotificationRequestResponse|null
    {
        return this._response;
    }


  send = async (): Promise<void> => {
      const request = new PostRequest(
        this._route,
        JSON.stringify(this._body)
      );

      await request.sendWithAuthorization();

      this._response = request.response;
    }
}

export default AnalyticsTrackNotificationRequest;
