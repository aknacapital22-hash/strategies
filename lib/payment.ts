// Where subscribers send payment. Change these in one place.
export const PAYEE_NAME = "Akshat Nahata";
export const UPI_ID = "akshatnahata05@ibl";
export const CONTACT_EMAIL = "business@aknacapital.com";
export const WHATSAPP_DISPLAY = "8989496800";
export const WHATSAPP_INTL = "918989496800"; // with country code, for wa.me links

/** A upi:// link: opens a UPI app on a phone with the payee and amount already filled in. */
export const upiLink = (amount: number, note: string) =>
  `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note.slice(0, 40))}`;

export const whatsappLink = (message: string) => `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(message)}`;

/** Short, readable request code shown to the user and the admin. */
export const shortId = (id: string) => id.replace(/-/g, "").slice(0, 8).toUpperCase();
