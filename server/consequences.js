function checkConsequences(state) {
  const conflicts = [];

  const totalExpenses = (state.expenses || []).reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  let remainingBudget = null;
  if (typeof state.budget === "number") {
    remainingBudget = state.budget - totalExpenses;
    if (remainingBudget < 0) {
      conflicts.push(
        `Expenses (Rs ${totalExpenses}) exceed the total budget (Rs ${state.budget}) by Rs ${Math.abs(
          remainingBudget
        )}. Consider recalculating the budget or reducing an expense.`
      );
    }
  }

  if (
    typeof state.attendees === "number" &&
    Array.isArray(state.venueOptions) &&
    state.venueOptions.length > 0
  ) {
    const stillFits = state.venueOptions.some((v) => v.capacity >= state.attendees);
    if (!stillFits) {
      conflicts.push(
        `None of the currently suggested venues can hold ${state.attendees} attendees. Call suggestVenues again with the updated headcount.`
      );
    }
  }

  return { conflicts, totalExpenses, remainingBudget };
}

module.exports = { checkConsequences };