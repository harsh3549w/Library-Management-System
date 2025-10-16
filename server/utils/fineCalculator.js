export const calculateFine = (dueDate) => {
  const finePerDay = 1; // ₹1 per day
  const today = new Date();
  
  if (today > dueDate) {
    // For testing: treat every 10 minutes as 1 day for fine calculation
    const lateMinutes = Math.ceil((today - dueDate) / (1000 * 60));
    const lateDays = Math.ceil(lateMinutes / 10); // Every 10 minutes = 1 day for testing
    const fine = lateDays * finePerDay;
    return fine;
  }
  return 0;
};