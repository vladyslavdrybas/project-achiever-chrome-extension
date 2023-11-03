export const jwt_decode = (token: string) => {
    if (!token) { return null; }

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jwt =  JSON.parse(atob(base64));

    const now = Math.floor(Date.now() / 1000);

    if (now - jwt.exp > -15) {
        return null;
    }

    console.log(jwt);
    console.log(now - jwt.exp);

    return jwt;
}
