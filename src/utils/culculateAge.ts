const calculateAge = (dobString?: string): number | null => {
    if (!dobString) return null;

    const dob = new Date(dobString);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const hasHadBirthdayThisYear =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    if (!hasHadBirthdayThisYear) age--;

    return age;
};

export default calculateAge;


export const generateUnifiedId = (str: string) => {
    const timestamp = Date.now(); // current time in ms
    const random = Math.floor(Math.random() * 1000000); // random 6‑digit number 
    return `${str}_${timestamp}_${random}`;
};