const StatisticsService = require("../services/statisticService");

const StatisticController = {
    getDoctorStatistics: async (req, res, next) => {
        const doctor = req.user;

        try {
            const countPatients = await StatisticsService.countPatients(doctor);
            const countAppointments = await StatisticsService.countAppointments(doctor.roleId);
            res.status(200).json({ countPatients, countAppointments });
        } catch (error) {
            next(error);
        }
    },
    getClinicStatistics: async (req, res, next) => {
        const clinic = req.user;

        try {
            const countPatients = await StatisticsService.countPatients(clinic);
            const averageRating = await StatisticsService.averageScore(clinic.id);
            res.status(200).json({ countPatients, averageRating });
        } catch (error) {
            next(error);
        }
    },
}

module.exports = StatisticController;