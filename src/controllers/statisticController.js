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
    getAdminStatistics: async (req, res, next) => {
        const { start_date, end_date } = req.query;

        try {
            const countUser = await StatisticsService.mainStatist(start_date, end_date);
            const statisticUser = await StatisticsService.countNewPatientsAndClinics();
            res.status(200).json({ countUser, statisticUser });
        } catch (error) {
            next(error);
        }
    },
    ratingsStatistics: async (req, res, next) => {
        try {
            const count = await StatisticsService.ratingsStatistics();
            res.status(200).json(count);
        } catch (error) {
            next(error);
        }
    },
    clinicProvinceStatistics: async (req, res, next) => {
        try {
            const count = await StatisticsService.clinicProvinceStatistics();
            res.status(200).json(count);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = StatisticController;