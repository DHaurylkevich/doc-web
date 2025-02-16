'use strict';

const realAddresses = [
    { city: 'Warszawa', street: 'Marszałkowska', province: 'Mazowieckie', post_index: '00-001' },
    { city: 'Kraków', street: 'Floriańska', province: 'Małopolskie', post_index: '30-001' },
    { city: 'Wrocław', street: 'Świdnicka', province: 'Dolnośląskie', post_index: '50-001' },
    { city: 'Gdańsk', street: 'Długa', province: 'Pomorskie', post_index: '80-001' },
];

function getRandomAddress() {
    const addr = realAddresses[Math.floor(Math.random() * realAddresses.length)];
    return {
        city: addr.city,
        street: addr.street,
        province: addr.province,
        home: Math.floor(Math.random() * 100) + 1,
        flat: Math.floor(Math.random() * 50) + 1,
        post_index: addr.post_index
    };
}

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        let addresses = clinics.map((clinic) => {
            const addr = getRandomAddress();
            return {
                clinic_id: clinic.id,
                city: addr.city,
                street: addr.street,
                province: addr.province,
                home: addr.home,
                flat: addr.flat,
                post_index: addr.post_index,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        await queryInterface.bulkInsert('addresses', addresses, {});

        const users = await queryInterface.sequelize.query(
            `SELECT id FROM users;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        addresses = users.map((user) => {
            const addr = getRandomAddress();
            return {
                user_id: user.id,
                city: addr.city,
                street: addr.street,
                province: addr.province,
                home: addr.home,
                flat: addr.flat,
                post_index: addr.post_index,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        await queryInterface.bulkInsert('addresses', addresses, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('addresses', null, {});
    }
};