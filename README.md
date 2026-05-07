# CloudCompare AI - Multi-Cloud Service Recommendation System

A Spring Boot application that leverages the Groq API to provide intelligent, real-time comparisons and recommendations across major cloud providers (AWS, GCP, Azure, OCI, Alibaba Cloud).

## Features

✨ **Core Capabilities:**
- 🔍 Real-time cloud service comparisons powered by Groq LLM AI
- 💰 Cost analysis and performance metrics
- 🎯 Service ranking and recommendations
- 🔐 Secure JWT-based authentication
- 📊 Interactive dashboards for visualization
- ⚡ Multi-cloud support (AWS, GCP, Azure, OCI, Alibaba)

### Service Categories:
- **Compute**: VMs, Serverless, Containers, Kubernetes, GPU Instances, HPC
- **Storage**: Object Storage, Block Storage, File Storage, CDN, Archive
- **Database**: SQL, NoSQL, Data Warehouses, Redis, Document, Time-Series
- **AI Services**: LLMs, Vision AI, NLP, Speech, Translation, Generative AI

## Tech Stack

**Backend:**
- Java 17 / Spring Boot 3.2.5
- Spring Security + JWT Authentication
- Spring Data JPA + H2 Database
- Maven

**Frontend:**
- HTML5 / CSS3 / JavaScript
- Chart.js for data visualization
- Font Awesome icons
- Responsive design

**AI/API:**
- Groq API (LLM-powered comparisons)
- Real-time data fetching

## Prerequisites

- **Java 17+** (Currently using Java 25.0.2)
- **Maven 3.8+** (Included via Maven Wrapper)
- **Groq API Key** (Free tier available at https://console.groq.com)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Godesivaramakrishna/Cloud-Compare-AI.git
cd Cloud-Compare-AI
```

### 2. Get Your Groq API Key
1. Visit [Groq Console](https://console.groq.com/login)
2. Create a free account
3. Generate an API key
4. Copy the key (format: `gsk_...`)

### 3. Configure API Key
Update `src/main/resources/application.properties`:
```properties
grok.api.key=YOUR_GROQ_API_KEY_HERE
grok.endpoint=https://api.groq.com/openai/v1/chat/completions
grok.model=llama-3.1-8b-instant
grok.timeout=20000
```

### 4. Build & Run

**Using Maven Wrapper:**
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

**Or using Maven:**
```bash
mvn spring-boot:run
```

The application will start on **http://localhost:5000**

## Usage

### Access the Application
- **Main App**: http://localhost:5000
- **Sign Up**: http://localhost:5000/signup.html
- **Login**: http://localhost:5000/login.html
- **H2 Console**: http://localhost:5000/h2-console

### Workflow
1. **Sign Up** - Create an account with email and password
2. **Login** - Authenticate with your credentials
3. **Select Category** - Choose from Compute, Storage, Database, or AI Services
4. **Configure Parameters** - Set CPU, RAM, Storage, Hours per month, Region, Priority
5. **Compare** - Get AI-powered recommendations with cost and performance analysis
6. **View Results** - Interactive charts and provider comparison tables

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Authenticate and get JWT token

### Default Offerings (No Auth Required)
- `GET /api/regions` - List available cloud regions
- `GET /api/service-types/{category}` - Get service types for category
- `GET /api/test` - Health check

### Comparisons (Requires Authentication)
- `POST /api/compare` - Get cloud service comparison
- `POST /api/ai-compare` - Get AI tools comparison

**Request Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Project Structure

```
src/main/java/com/cloudcompare/ai/
├── controller/
│   ├── ApiController.java        # REST endpoints
│   └── AuthController.java       # Authentication
├── service/
│   ├── GrokClientService.java    # Groq API integration
│   ├── CacheService.java         # LRU caching
│   └── RankingService.java       # Result ranking
├── security/
│   ├── SecurityConfig.java       # Spring Security setup
│   ├── JwtUtil.java              # JWT token handling
│   ├── JwtAuthorizationFilter.java # JWT filter
│   └── CustomUserDetailsService.java
├── entity/
│   └── UserEntity.java           # User model
├── repository/
│   └── UserRepository.java       # User data access
├── dto/
│   ├── CompareRequest.java
│   ├── CompareResponse.java
│   ├── LoginRequest.java
│   ├── SignupRequest.java
│   └── Others...
└── config/
    ├── WebConfig.java            # CORS configuration
    └── RateLimitFilter.java       # Rate limiting

src/main/resources/
├── application.properties         # Configuration
└── static/
    ├── index.html                # Main dashboard
    ├── login.html                # Login page
    ├── signup.html               # Registration page
    ├── style.css                 # Styling
    └── script.js                 # Frontend logic
```

## Configuration

### application.properties

| Property | Default | Description |
|----------|---------|-------------|
| `server.port` | 5000 | Server port |
| `grok.api.key` | - | **Required**: Your Groq API key |
| `grok.endpoint` | https://api.groq.com/openai/v1/chat/completions | Groq API endpoint |
| `grok.model` | llama-3.1-8b-instant | AI model to use |
| `grok.timeout` | 20000 | Request timeout (ms) |
| `jwt.secret` | 9B91AE3F... | JWT signing key |
| `jwt.expiration` | 86400000 | Token validity (24h) |

## Performance Tuning

### Timeout Configuration
Currently set to **20 seconds** for Groq API calls. Adjust in `application.properties`:
```properties
grok.timeout=20000  # milliseconds
```

### Caching
Results are cached using LRU (Least Recently Used) strategy to:
- Reduce API calls to Groq
- Improve response time
- Stay within free tier rate limits

## Authentication Flow

1. **Sign Up**: POST `/api/auth/signup` with email/password
2. **Login**: POST `/api/auth/login` receives JWT token
3. **Store Token**: Saved in browser localStorage
4. **Attach Token**: Sent automatically with each API request
5. **Authorization**: JWT filter validates token on protected endpoints

Token expires after **24 hours** - login again to refresh.

## Troubleshooting

### Error: `Failed to compare services. HTTP error! status: 403`
**Solution**: You must log in first. The compare endpoint requires authentication.
1. Go to http://localhost:5000/signup.html
2. Create an account
3. Go to http://localhost:5000/login.html
4. Log in with your credentials

### Error: `Groq API error: Connection timeout`
**Solution**: Increase timeout in `application.properties`:
```properties
grok.timeout=30000  # Increase to 30 seconds
```

### API Key Error
**Solution**: Verify your API key:
1. Check it starts with `gsk_`
2. Ensure it's correctly pasted in `application.properties`
3. Restart the application after changing the key

## Development Notes

- **Database**: H2 in-memory (auto-resets on restart)
- **Cache**: LRU with 100-entry limit
- **Rate Limiting**: 60 requests/minute per IP
- **CORS**: Enabled for localhost:5000
- **Data Loss**: In-memory, not persisted

## Future Enhancements

- [ ] Persistent database (PostgreSQL/MySQL)
- [ ] More cloud providers (Digital Ocean, Linode, etc.)
- [ ] Cost prediction models
- [ ] Custom recommendation templates
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Performance benchmarks

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support & Contact

- **Issues**: Report bugs on GitHub Issues
- **Questions**: Create a GitHub Discussion
- **Email**: Contact project maintainer

## Acknowledgments

- **Groq AI** - For the powerful LLM API
- **Spring Framework** - For the excellent Java eco-system
- **Chart.js** - For beautiful data visualizations

---

**Built with ❤️ using Spring Boot and Groq AI**

Last Updated: May 7, 2026
