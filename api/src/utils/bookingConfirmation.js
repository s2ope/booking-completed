import { sendBookingAcceptedEmail } from "./bookingEmail.js";

export const sendBookingConfirmationEmailOnce = async (
  bookingDoc,
  hydratedBooking
) => {
  if (bookingDoc.confirmationEmailSentAt) {
    return {
      alreadySent: true,
      sent: false,
      to:
        hydratedBooking?.user?.email || bookingDoc.user?.email || bookingDoc.userEmail,
    };
  }

  const acceptedEmail = await sendBookingAcceptedEmail(
    hydratedBooking || bookingDoc
  );

  bookingDoc.confirmationEmailSentAt = new Date();
  await bookingDoc.save();

  return {
    alreadySent: false,
    sent: true,
    to: acceptedEmail?.to,
  };
};
