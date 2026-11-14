import { nigerianClock } from "../catalogue/vendor-availability";

// Availability is calculated before paging, so a closed nearby kitchen cannot
// push an open kitchen onto a later page. Hours use the same Africa/Lagos clock
// and overnight rules as the catalogue presenter.
export function acceptingOrdersExpression(now: Date) {
  const { day, time } = nigerianClock(now);
  return {
    $and: [
      { $eq: ["$acceptingOrders", true] },
      {
        $anyElementTrue: {
          $map: {
            input: { $ifNull: ["$openingHours", []] },
            as: "hours",
            in: {
              $or: [
                {
                  $and: [
                    { $eq: ["$$hours.day", day] },
                    { $lt: ["$$hours.opensAt", "$$hours.closesAt"] },
                    { $lte: ["$$hours.opensAt", time] },
                    { $gt: ["$$hours.closesAt", time] },
                  ],
                },
                {
                  $and: [
                    { $eq: ["$$hours.day", day] },
                    { $gt: ["$$hours.opensAt", "$$hours.closesAt"] },
                    { $lte: ["$$hours.opensAt", time] },
                  ],
                },
                {
                  $and: [
                    { $eq: ["$$hours.day", (day + 6) % 7] },
                    { $gt: ["$$hours.opensAt", "$$hours.closesAt"] },
                    { $gt: ["$$hours.closesAt", time] },
                  ],
                },
              ],
            },
          },
        },
      },
    ],
  };
}
