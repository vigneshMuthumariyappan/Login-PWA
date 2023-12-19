'use client'
export const setCookies = (name, value, duration) => document.cookie = `${name}=${value}; expires= ${duration}`;

export const getOnedayFuture = () =>  new Date().setDate(new Date().getDate() +1);


export const getCookie = (cname) => {
    // eslint-disable-next-line prefer-template
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}