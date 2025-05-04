const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const { Hotel } = require("../models");

class HotelService {
    constructor(db) {
        this.client = db.sequelize;
    }

    // Opprett hotell med raw SQL
    async create(name, location) {
        try {
            const result = await sequelize.query(
                'INSERT INTO Hotels (Name, Location) VALUES (:Name, :Location)',
                {
                    replacements: { Name: name, Location: location },
                }
            );
            return result;
        } catch (err) {
            return err;
        }
    }

    // Hent alle hoteller (ORM brukt her – dette er helt fint!)
    async get() {
        const hotels = await Hotel.findAll();
        return hotels;
    }

    // Hent detaljer for ett hotell med rating og om bruker har ratet
    async getHotelDetails(hotelId, userId) {
        try {
            const hotel = await sequelize.query(
                `SELECT h.id, h.Name, h.Location, ROUND(AVG(r.Value), 1) AS AvgRate
                 FROM Hotels h
                 LEFT JOIN Rates r ON h.id = r.HotelId
                 WHERE h.id = :hotelId`,
                {
                    replacements: { hotelId },
                    type: QueryTypes.SELECT,
                }
            );

            const userRateCount = await sequelize.query(
                `SELECT COUNT(*) as Rated FROM Rates
                 WHERE HotelId = :hotelId AND UserId = :userId`,
                {
                    replacements: { hotelId, userId },
                    type: QueryTypes.SELECT,
                }
            );

            hotel[0].Rated = userRateCount[0].Rated > 0;
            return hotel[0];
        } catch (err) {
            return err;
        }
    }

    // Slett hotell
    async deleteHotel(hotelId) {
        try {
            const result = await sequelize.query(
                'DELETE FROM Hotels WHERE id = :hotelId',
                {
                    replacements: { hotelId },
                }
            );
            return result;
        } catch (err) {
            return err;
        }
    }

    // Gi vurdering til hotell
    async makeARate(userId, hotelId, value) {
        try {
            const result = await sequelize.query(
                'INSERT INTO Rates (Value, HotelId, UserId) VALUES (:value, :hotelId, :userId)',
                {
                    replacements: { userId, hotelId, value },
                }
            );
            return result;
        } catch (err) {
            return err;
        }
    }
}

module.exports = HotelService;
