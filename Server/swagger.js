const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'Documentation for TravelSphere API',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Backend server',
      },
    ],
  },
  apis: ['./routes/user.js','./routes/agency.js','./routes/admin.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
