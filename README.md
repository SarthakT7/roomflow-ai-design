# RoomFlow – AI Room Transformation Platform

## What is RoomFlow?
RoomFlow is an AI-powered web platform that transforms photos of your rooms into stunning, professionally designed interiors in seconds. Simply upload a photo, choose from a variety of design styles, and let the AI generate a high-quality makeover. RoomFlow helps homeowners, renters, and interior designers visualize new possibilities for their spaces—no design experience required.

**Problems Solved:**
- Instantly visualize your room in different interior styles.
- Save time and money on design consultations.
- Get high-quality, shareable before/after images.
- Try out multiple looks before committing to a renovation.

---

## Technologies Used

- **Frontend:** React, TypeScript, Vite, TailwindCSS, shadcn/ui, Radix UI
- **Backend/Serverless:** Supabase (auth, storage, database, edge functions)
- **AI/ML:** Replicate API (for image transformation)

---

## Demo Video

> Example: [Watch the RoomFlow Demo](https://your-demo-link.com)

---

## Local Setup Guidelines

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd roomflow-ai-design
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` (create one if not present).
   - Add your Supabase project URL and anon key:
     ```
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
   - (Optional) Add Replicate API key and other secrets as needed for serverless functions.

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Open the app:**
   - Visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## Additional Information

- **Free Trial:** New users get 3 free transformations.
- **Supported Image Formats:** JPG, PNG, WebP (min. 512x512px recommended).
- **Privacy:** Your images are processed securely and never shared with third parties.
- **Plans:** Starter, Pro, and Enterprise plans available for more transformations and features.
- **Support:** For help, open an issue or contact the maintainer.
