export const dateToString = (input: Date) => {
    console.log("input date: ", input);
    const date = input.getDate();
    const month = input.getMonth() + 1;
    const year = input.getFullYear();
    const day = date + "/" + month + "/" + year;
    let hour: string | number = input.getHours();
    let minute : string | number = input.getMonth();
    hour = hour < 9 ? '0' + hour : minute;
    minute = minute < 9 ? '0' + minute : minute;
    console.log("input hour, minut: ", hour, minute);
    return day + ", " + hour + ":" + minute;
}