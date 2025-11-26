# PhiloMind 🧠

**The Mirror of the Soul**

PhiloMind is an interactive web application that assesses your "Philosophical Maturity" and assigns you a unique "Philosophical Persona" based on your responses to deep, thought-provoking questions. Powered by Google's Gemini AI, it provides personalized insights into your worldview, ethics, and decision-making style.

![PhiloMind Preview](philomind.vercel.app)

## ✨ Features

-   **Deep Philosophical Questionnaire**: A curated set of questions designed to probe your ethical and metaphysical leanings.
-   **AI-Powered Analysis**: Uses the Gemini API to analyze your answers and generate a detailed philosophical profile.
-   **Liquid Glass UI**: A stunning, modern interface featuring glassmorphism, fluid animations, and a premium "Navy & Amber" aesthetic.
-   **Philosophical Persona**: Discover if you are a "Stoic Individualist", "Rational Humanist", or another unique archetype.
-   **Shareable Insight Cards**: Generate beautiful, social-media-ready images of your results to share with friends.
-   **Mobile Responsive**: A seamless experience across all devices, from desktop to mobile.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS, Vanilla CSS (for custom animations)
-   **AI Integration**: Google Gemini API (`@google/generative-ai`)
-   **Icons**: Lucide React
-   **Utilities**: `html-to-image` (for generating share cards)

## 🚀 Run Locally

Follow these steps to get PhiloMind running on your local machine.

### Prerequisites

-   Node.js (v18+ recommended)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Sayanthegamer/philomind.git
    cd philomind
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    -   Create a `.env` file in the root directory (or rename `.env.example` if available).
    -   Add your Google Gemini API key:
        ```env
        VITE_GEMINI_API_KEY=your_actual_api_key_here
        ```
    > **Note:** You can get a free API key from [Google AI Studio](https://aistudio.google.com/).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to `http://localhost:5173` (or the URL shown in your terminal).

## 📦 Build for Production

To create a production-ready build:

```bash
npm run build
```

This will generate static files in the `dist` directory, ready to be deployed to Vercel, Netlify, or any static host.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
