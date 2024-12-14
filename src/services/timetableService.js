const db = require("../models");
const AppError = require("../utils/appError");
const sequelize = require("../config/db");

const TimetableService = {
    createTimetable: async (clinicId, t) => {
        try {
            const timetables = [];

            for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
                const timetableEntry = {
                    clinic_id: clinicId,
                    day_of_week: dayOfWeek,
                };

                timetables.push(timetableEntry);
            }

            await db.Timetables.bulkCreate(timetables, { transaction: t });

            return await db.Timetables.bulkCreate(timetables);
        } catch (err) {
            throw err;
        }
    },
    updateTimetable: async (clinicId, timetablesData) => {
        try {
            const validatedData = timetablesData.map(data => {
                if (data.dayOfWeek === undefined || data.dayOfWeek < 1 || data.dayOfWeek > 7) {
                    throw new AppError("Invalid day of week. Must be between 1 and 7", 400);
                }
                if (data.startTime === undefined || data.endTime === undefined || data.startTime >= data.endTime) {
                    throw new AppError("Start time must be before end time", 400);
                }

                return data;
            });

            const result = await sequelize.transaction(async (t) => {
                const updatePromises = validatedData.map(async (timetableData) => {
                    return await db.Timetables.upsert({
                        clinic_id: clinicId,
                        day_of_week: timetableData.dayOfWeek,
                        start_time: timetableData.startTime,
                        end_time: timetableData.endTime
                    }, {
                        transaction: t
                    });
                });

                return await Promise.all(updatePromises);
            });

            return result;
        } catch (err) {
            throw err;
        }
    },
}

module.exports = TimetableService;