require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require('chai');
// const server = require("../../index");
const io = require('socket.io-client');
const db = require('../../src/models');

describe('WebSocket Chat Tests', () => {
    let client1, client2;

    beforeEach(() => {
        const mockSession1 = {
            passport: {
                user: 1
            }
        };

        const mockSession2 = {
            passport: {
                user: 2
            }
        };

        client1 = io.connect('http://localhost:3000', {
            reconnection: false,
            auth: { session: mockSession1 }
        });

        client2 = io.connect('http://localhost:3000', {
            reconnection: false,
            auth: { session: mockSession2 }
        });

        let connected = 0;
        [client1, client2].forEach(client => {
            client.on('connect', () => {
                connected++;
                if (connected === 2) done();
            });
        });
    });

    afterEach(() => {
        if (client1.connected) client1.disconnect();
        if (client2.connected) client2.disconnect();
    });

    it('should connect successfully', () => {
        client1.on('connection', () => {
            expect(client1.connected).to.be.true;
        });
    });

    it('should send and receive messages', () => {
        const testMessage = {
            recipientId: 2,
            content: 'Test message'
        };

        client2.on('receiveMessage', (message) => {
            expect(message.content).to.equal(testMessage.content);
            expect(message.sender_id).to.equal(1);
            expect(message.receiver_id).to.equal(2);
        });

        client1.emit('sendMessage', testMessage);
    });

    it('should save message to database', (done) => {
        const testMessage = {
            recipientId: 2,
            content: 'Test message for DB'
        };

        client1.emit('sendMessage', testMessage);

        const savedMessage = db.Messages.findOne({
            where: {
                content: testMessage.content
            }
        });
        console.log(savedMessage);
        expect(savedMessage).to.exist;
        expect(savedMessage.content).to.equal(testMessage.content);
        expect(savedMessage).to.exist;
        expect(savedMessage.content).to.equal(testMessage.content);
        expect(savedMessage.sender_id).to.equal(1);
        expect(savedMessage.receiver_id).to.equal(2);
        done();
    });

    // it('should update message status to read', async () => {
    //     // const message = await db.Messages.create({
    //     //     sender_id: 1,
    //     //     receiver_id: 2,
    //     //     content: 'Test message',
    //     //     status: 'delivered'
    //     // });

    //     client1.emit('readMessage', { messageId: message.id });

    //     const updatedMessage = await db.Messages.findByPk(message.id);
    //     expect(updatedMessage.status).to.equal('read');
    // });
});