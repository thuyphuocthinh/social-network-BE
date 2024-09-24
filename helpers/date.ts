export const dateToString = (input: Date) => {
    const date = input.getDate();
    const month = input.getMonth() + 1;
    const year = input.getFullYear();
    const day = date + "/" + month + "/" + year;
    let hour: string | number = input.getHours();
    let minute : string | number = input.getMinutes();
    hour = hour < 9 ? '0' + hour : minute;
    minute = minute < 9 ? '0' + minute : minute;
    return day + ", " + hour + ":" + minute;
}