# GroundSchoolAI

An AI-powered aviation study platform designed to help pilots prepare for their ground school examinations.

## Features

- **Document Management**: Upload and manage study materials with Supabase Storage
- **Question Bank**: Access a comprehensive database of aviation exam questions
- **AI-Powered Learning**: Get personalized study recommendations and explanations
- **Study Progress Tracking**: Monitor your learning journey and identify areas for improvement
- **Mobile-First Design**: Study anywhere with our React Native mobile app

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (Database, Storage, and Authentication)
- **AI Integration**: OpenAI and Anthropic for intelligent tutoring
- **State Management**: React Context API
- **UI Components**: React Native Elements and Paper
- **Type Safety**: TypeScript

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/GroundSchoolAI.git
cd GroundSchoolAI
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase and AI API keys
```

4. Start the development server:
```bash
npm start
```

5. Run on your device:
- Scan the QR code with the Expo Go app
- Press 'i' for iOS simulator
- Press 'a' for Android emulator

## Project Structure

```
src/
├── components/      # Reusable UI components
├── screens/         # Screen components
├── services/        # API and business logic
├── contexts/        # React Context providers
├── config/          # Configuration files
└── types/          # TypeScript type definitions
```

## Environment Variables

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)
Project Link: [https://github.com/yourusername/GroundSchoolAI](https://github.com/yourusername/GroundSchoolAI)
