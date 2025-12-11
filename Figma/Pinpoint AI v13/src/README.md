# Pinpoint AI - AI Tool Discovery Platform

A cozy, minimal, earthy design platform for discovering AI tools, featuring dark mode support and Figma API integration.

## 🎨 Design Philosophy

- **Boutique library, not a marketplace**: Premium minimalism with editorial-style sections
- **Warm & Earthy**: Soft beige backgrounds, muted greens, warm taupes, subtle olive accents
- **Generous Whitespace**: Uncluttered, airy feel with soft rounded corners
- **Human-Centered**: Magazine-style aesthetic that feels approachable and trustworthy

## ✨ Features

- 🏠 **Homepage**: Hero section, trending tools, categories, and editorial collections
- 🔍 **Search Results**: Sophisticated filtering and sorting with smart recommendations
- 📄 **Tool Details**: 18 comprehensive sections including trust scores, sentiment analysis, pricing breakdown
- 🌓 **Dark Mode**: Full dark mode support across all pages
- 🎨 **Figma Integration**: Sync design tokens and assets directly from Figma
- ♿ **Accessible**: Built with accessibility in mind

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Figma account (optional, for design sync)
- Backend API (optional, currently uses mock data)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pinpoint-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 📁 Project Structure

```
pinpoint-ai/
├── components/          # React components
│   ├── SearchResults.tsx
│   ├── ToolPage.tsx
│   ├── ThemeToggle.tsx
│   └── ui/             # Shadcn UI components
├── lib/                # Utility functions
│   ├── figma.ts        # Figma API client
│   └── figma-sync.ts   # Figma sync utilities
├── scripts/            # Automation scripts
│   ├── sync-figma-tokens.ts
│   └── download-figma-assets.ts
├── styles/             # Global styles
│   └── globals.css
├── docs/               # Documentation
│   ├── FIGMA_INTEGRATION.md
│   └── BACKEND_INTEGRATION.md
└── App.tsx             # Main component
```

## 🎨 Figma Integration

### Quick Start

1. **Get your Figma credentials**:
   - API Token: [Figma Settings](https://www.figma.com/settings)
   - File Key: From your Figma file URL

2. **Set up environment variables**:
   ```env
   FIGMA_API_TOKEN=your_token_here
   FIGMA_FILE_KEY=your_file_key_here
   ```

3. **Sync design tokens**:
   ```bash
   # Preview changes
   npm run figma:sync:dry
   
   # Sync for real
   npm run figma:sync
   
   # Compare with current
   npm run figma:compare
   ```

4. **Download assets**:
   ```bash
   # Download all assets
   npm run figma:assets
   
   # Download icons
   npm run figma:icons
   
   # Generate manifest
   npm run figma:manifest
   ```

📖 **Full guide**: See [FIGMA_INTEGRATION.md](./docs/FIGMA_INTEGRATION.md)

## 🔌 Backend Integration

Currently using mock data. To connect to your backend:

1. **Create API routes** in `/app/api/`
2. **Replace mock data** with real API calls
3. **Set up database** (Prisma, Supabase, etc.)
4. **Add authentication** (optional)

📖 **Full guide**: See [BACKEND_INTEGRATION.md](./docs/BACKEND_INTEGRATION.md)

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

### Figma Sync
```bash
npm run figma:sync       # Sync design tokens from Figma
npm run figma:sync:dry   # Preview token changes
npm run figma:compare    # Compare Figma vs current tokens
npm run figma:assets     # Download assets from Figma
npm run figma:icons      # Download icons specifically
npm run figma:manifest   # Generate asset manifest
```

## 🎨 Design Tokens

### Colors (Light Mode)
- **Background**: `#F5F2EB` - Soft beige
- **Foreground**: `#3D3834` - Warm dark brown
- **Primary**: `#6E7E55` - Muted olive green
- **Accent**: `#AFC1A1` - Soft sage
- **Accent Warm**: `#D4A574` - Warm taupe
- **Destructive**: `#C46A4A` - Terracotta

### Colors (Dark Mode)
- **Background**: `#2A2622` - Deep warm brown
- **Foreground**: `#F5F2EB` - Soft beige
- **Primary**: `#AFC1A1` - Soft sage
- **Accent**: `#6E7E55` - Muted olive

### Typography
- **Font Family**: Inter
- **Base Size**: 16px
- **Headings**: Medium weight (500)
- **Body**: Normal weight (400)
- **Line Height**: 1.5

### Spacing
- **Radius**: 1rem (16px) - Soft rounded corners
- **Whitespace**: Generous padding and margins for breathing room

## 🧩 Components

### UI Components (Shadcn)
- Accordion, Alert, Badge, Button, Card, Carousel
- Chart, Checkbox, Dialog, Dropdown, Form, Input
- Navigation, Popover, Select, Table, Tabs, Toast
- And many more!

### Custom Components
- **SearchResults**: Advanced search results with filtering
- **ToolPage**: Comprehensive tool detail page (18 sections)
- **ThemeToggle**: Light/dark mode switcher
- **CircularScore**: Animated score visualization
- **ScoreCircle**: Trust score display

## 🌓 Dark Mode

Dark mode is implemented using CSS custom properties and a theme toggle component.

```typescript
// Use in components
<ThemeToggle />

// Check theme in JavaScript
const isDark = document.documentElement.classList.contains('dark');
```

## 📊 Tool Detail Sections

The tool page includes 18 comprehensive sections:

1. Hero with key metrics
2. Trust score with breakdown
3. Sentiment analysis with charts
4. Feature verification
5. Pros and cons
6. Editor's notes
7. Detailed pricing
8. Use cases
9. Integration capabilities
10. Performance metrics
11. Support quality
12. Security & compliance
13. User testimonials
14. Comparison with alternatives
15. Traffic & popularity trends
16. FAQ section
17. Update history
18. Related tools

## 🔒 Environment Variables

```env
# Figma API (for design sync)
FIGMA_API_TOKEN=your_figma_token
FIGMA_FILE_KEY=your_file_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Database (if using)
DATABASE_URL=your_database_url

# Authentication (if using)
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms

Build the app:
```bash
npm run build
```

Then deploy the `.next` folder to your platform of choice.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check `/docs` folder
- **Figma Integration**: See [FIGMA_INTEGRATION.md](./docs/FIGMA_INTEGRATION.md)
- **Backend Integration**: See [BACKEND_INTEGRATION.md](./docs/BACKEND_INTEGRATION.md)

## 🎯 Roadmap

- [x] Homepage with trending tools
- [x] Search results page
- [x] Tool detail page (18 sections)
- [x] Dark mode support
- [x] Figma API integration
- [ ] Backend API integration
- [ ] User authentication
- [ ] User reviews & ratings
- [ ] Tool submission form
- [ ] Advanced filtering
- [ ] Personalized recommendations
- [ ] API for third-party integrations

## 💡 Tips

1. **Organize your Figma file** with dedicated frames for Colors, Typography, Spacing
2. **Run sync scripts** regularly to keep design tokens up to date
3. **Use environment variables** for sensitive credentials
4. **Test dark mode** thoroughly across all components
5. **Keep components modular** for easier maintenance

---

Built with ❤️ using Next.js, React, Tailwind CSS, and Figma API

**Start building amazing things!** 🚀
