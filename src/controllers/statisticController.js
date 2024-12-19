const StatisticsService = require("../services/statisticService");

const StatisticController = {
    getDoctorStatistics: async (req, res, next) => {
        const doctor = req.user;

        try {
            const countPatient = await StatisticsService.countPatients(doctor);
            const countAppointments = await StatisticsService.countAppointments(doctor.roleId);
            res.status(200).json({ countPatient, countAppointments });
        } catch (error) {
            next(error);
        }
    },
    getClinicStatistics: async (req, res, next) => {
        const clinic = req.user;

        try {
            const count = await StatisticsService.countPatients(clinic);
            const averageRating = await StatisticsService.averageScore(clinic.id);
            res.status(200).json({ count, averageRating });
        } catch (error) {
            next(error);
        }
    },
}

module.exports = StatisticController;