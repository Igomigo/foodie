/**
 * This service is used to get the user's current location from ipapi.co
 */
export const getLocation = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return `${data.city}, ${data.country_name}`;
    } catch (error) {
        return "Location";
    }
}
