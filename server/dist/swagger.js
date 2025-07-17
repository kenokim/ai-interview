import swaggerJSDoc from 'swagger-jsdoc';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AI Interview API',
            version: '1.0.0',
            description: 'API documentation for the AI Interview server.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/types/api.ts'],
};
// @ts-ignore
const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
//# sourceMappingURL=swagger.js.map