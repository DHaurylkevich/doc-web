const TimetableService = require("../services/timetableService");

const TimetableController = {
    getAllTimetables: async (req, res, next) => {
        try {
            const Timetables = await TimetableService.getAllTimetables()
            res.status(200).json(Timetables);
        } catch (err) {
            next(err);
        }
    },
    updateTimetable: async (req, res, next) => {
        const { clinicId } = req.params;
        const { timetablesData } = req.body;

        try {
            const updateTimetable = await TimetableService.updateTimetable(clinicId, timetablesData);
            res.status(200).json(updateTimetable);
        } catch (err) {
            next(err);
        }
    }
};

module.exports = TimetableController;