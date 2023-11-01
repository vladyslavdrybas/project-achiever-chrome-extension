export {};

declare global {
  interface Window {
    registration: any;
  }
  interface Event {
    data: any;
    waitUntil: any;
    notification: any;
    action: string;
  }
}
