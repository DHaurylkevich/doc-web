// const db = require("../models");

// const ratingService = {
//     getRating: async () => {
//         return await db.Ratings.findByPk(1, { attributes: ["total_rating", "votes"] });
//     },
//     updateRating: async (rating) => {
//         const totalRating = await db.Ratings.findByPk(1);

//         if (totalRating) {
//             const votes = totalRating.votes + 1;
//             const total_rating = (totalRating.total_rating * totalRating.votes + rating) / votes;
//             return await totalRating.update({ total_rating: total_rating, votes: votes });
//         } else {
//             return await db.Ratings.create({ total_rating: rating, votes: 1 });
//         }
//     }
// }

// module.exports = ratingService;