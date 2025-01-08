const db = require("../models");
const AppError = require("../utils/appError");

const TimetableService = {
    createTimetable: async (clinicId, t) => {
        await db.Timetables.bulkCreate(
            Array.from({ length: 7 }, (_, i) => ({
                clinic_id: clinicId,
                day_of_week: i + 1,
            })),
            { transaction: t });
    },
    updateTimetable: async (clinicId, timetablesData) => {
        const validatedData = timetablesData.map(data => {
            if (!Number.isInteger(data.dayOfWeek) || data.dayOfWeek < 1 || data.dayOfWeek > 7) {
                throw new AppError("Invalid day of week. Must be between 1 and 7", 400);
            }
            if (!data.startTime || !data.endTime || data.startTime >= data.endTime) {
                throw new AppError("Start time must be before end time", 400);
            }

            return {
                id: data.id,
                clinic_id: clinicId,
                day_of_week: data.dayOfWeek,
                start_time: data.startTime,
                end_time: data.endTime
            };
        });

        // await sequelize.transaction(async (t) => {
        //     const updatePromises = validatedData.map(async (timetableData) => {
        //         return await db.Timetables.upsert({
        //             clinic_id: clinicId,
        //             day_of_week: timetableData.dayOfWeek,
        //             start_time: timetableData.startTime,
        //             end_time: timetableData.endTime
        //         }, {
        //             transaction: t
        //         });
        //     });
        //     return await Promise.all(updatePromises);
        // });

        await db.Timetables.bulkCreate(validatedData, { updateOnDuplicate: ["start_time", "end_time"] });
    },
}

module.exports = TimetableService;