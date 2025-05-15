# Setting Up API Documentation

This document explains how to set up and use the API documentation for the Snagr AI application.

## Overview

The API documentation for Snagr AI consists of:

1. **Markdown Documentation**: Detailed documentation in Markdown format for human readability
2. **OpenAPI Specification**: Machine-readable API specification in OpenAPI/Swagger format
3. **Interactive Documentation**: Swagger UI for interactive API exploration and testing

## Directory Structure

```
docs/api/
├── overview.md                  # Overview of the API
├── endpoints/                   # Detailed documentation for each endpoint group
│   ├── authentication.md
│   ├── users.md
│   ├── searches.md
│   ├── matches.md
│   ├── payments.md
│   └── notifications.md
└── openapi/                     # OpenAPI specification
    └── openapi.yaml
```

## Setting Up Swagger UI

To set up Swagger UI for interactive API documentation:

1. Install the required packages:

```bash
npm install swagger-ui-react swagger-ui-dist next-swagger-doc
```

2. Create a new API route for the OpenAPI specification:

```typescript
// pages/api/docs.ts
import { createSwaggerSpec } from 'next-swagger-doc';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const getApiDocs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const yamlSpec = readFileSync(
      join(process.cwd(), 'docs/api/openapi/openapi.yaml'),
      'utf8'
    );
    
    const spec = createSwaggerSpec({
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Snagr AI API',
          version: '1.0.0',
        },
      },
      apiFolder: 'pages/api',
      schemaFolders: ['models'],
      outputFile: '',
      yaml: yamlSpec,
    });
    
    res.status(200).json(spec);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating API docs' });
  }
};

export default getApiDocs;
```

3. Create a page for the Swagger UI:

```typescript
// pages/api-docs.tsx
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import { readFileSync } from 'fs';
import { join } from 'path';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic<{
  spec: Record<string, any>;
}>(import('swagger-ui-react'), { ssr: false });

function ApiDocs({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  return <SwaggerUI spec={spec} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const yamlSpec = readFileSync(
    join(process.cwd(), 'docs/api/openapi/openapi.yaml'),
    'utf8'
  );
  
  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Snagr AI API',
        version: '1.0.0',
      },
    },
    apiFolder: 'pages/api',
    schemaFolders: ['models'],
    outputFile: '',
    yaml: yamlSpec,
  });

  return {
    props: {
      spec,
    },
  };
};

export default ApiDocs;
```

4. Add a link to the API documentation in your application's navigation.

## Using the API Documentation

### For Developers

1. **Markdown Documentation**: Browse the Markdown files in the `docs/api/` directory for detailed information about each endpoint.

2. **Interactive Documentation**: Visit `/api-docs` in your browser to explore the API interactively:
   - Development: `http://localhost:3000/api-docs`
   - Production: `https://[production-domain]/api-docs`

3. **OpenAPI Specification**: Use the OpenAPI specification at `/api/docs` for integration with API tools:
   - Development: `http://localhost:3000/api/docs`
   - Production: `https://[production-domain]/api/docs`

### For API Consumers

1. **Interactive Documentation**: Visit the API documentation page to explore available endpoints, request/response formats, and authentication requirements.

2. **Authentication**: Most endpoints require authentication using JWT tokens:
   - Register a new user: `POST /api/v1/auth/register`
   - Login: `POST /api/v1/auth/login`
   - Use the returned token in the `Authorization` header: `Authorization: Bearer [token]`

3. **Error Handling**: All API responses follow a consistent format:
   - Success: `{ "success": true, "data": { ... } }`
   - Error: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "Error message" } }`

## Updating the Documentation

### Updating Markdown Documentation

1. Edit the relevant Markdown files in the `docs/api/` directory.
2. Commit the changes to the repository.

### Updating OpenAPI Specification

1. Edit the `docs/api/openapi/openapi.yaml` file.
2. Commit the changes to the repository.
3. The changes will be reflected in the interactive documentation automatically.

## Best Practices

1. **Keep Documentation in Sync**: Always update the documentation when making changes to the API.
2. **Document All Endpoints**: Ensure all endpoints are documented in both Markdown and OpenAPI formats.
3. **Include Examples**: Provide request and response examples for all endpoints.
4. **Document Error Responses**: Document all possible error responses for each endpoint.
5. **Use Consistent Formatting**: Follow the established formatting conventions for consistency.