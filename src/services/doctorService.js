// if (user.role === "doctor") {
//     const center = await medical_centers.findOne({ where: { center_id: user.center_id } });
//     if (!center) {
//         throw new Error("Medical center not found");
//     }
// }
// transactionStub = sinon.stub(sequelize, "transaction").resolves({
//     commit: sinon.fake.resolves(),
//     rollback: sinon.fake.resolves(),
// });
// expect(transactionStub.calledOnce).to.be.true;