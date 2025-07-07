# Choco's Online - Multiple Video Background Options

## 🎥 Video Background Options

Your website now supports multiple video backgrounds with two elegant approaches:

### Option 1: Video Carousel (Currently Active)
- **Features**: Smooth transitions between videos with navigation dots and arrows
- **Auto-play**: Videos automatically cycle every 8 seconds
- **Controls**: Click dots or arrows to manually navigate
- **Hover**: Auto-play pauses when hovering over the hero section
- **Mobile**: Optimized controls for touch devices

### Option 2: Video Grid Layout (Alternative)
- **Features**: Multiple videos displayed simultaneously in a grid
- **Layout**: Main video (2/3 width) + 2 smaller videos (1/3 width each)
- **Responsive**: Stacks vertically on mobile devices
- **Performance**: All videos play simultaneously

## 📁 Video File Setup

### For Video Carousel:
1. Place your video files in the `images/` folder:
   - `video.mp4` (main video)
   - `video2.mp4` (second video)
   - `video3.mp4` (third video)

2. Update the HTML to match your video filenames:
```html
<video class="hero-video active" src="images/your-video1.mp4" ...></video>
<video class="hero-video" src="images/your-video2.mp4" ...></video>
<video class="hero-video" src="images/your-video3.mp4" ...></video>
```

3. Update the navigation dots count:
```html
<button class="hero-video-dot active" data-video="0" aria-label="Video 1"></button>
<button class="hero-video-dot" data-video="1" aria-label="Video 2"></button>
<button class="hero-video-dot" data-video="2" aria-label="Video 3"></button>
```

### For Video Grid Layout:
1. Uncomment the grid layout section in `index.html`
2. Comment out the carousel section
3. Update video sources in the grid layout

## 🎨 Customization Options

### Video Carousel Settings:
- **Auto-play interval**: Change `8000` in `app.js` (line with `setInterval(nextVideo, 8000)`)
- **Transition speed**: Modify `transition: opacity 0.8s ease-in-out` in CSS
- **Navigation style**: Customize dot and arrow styles in CSS

### Video Grid Settings:
- **Grid layout**: Modify `grid-template-columns` and `grid-template-rows` in CSS
- **Gap size**: Change `gap: 8px` in `.hero-video-grid`
- **Border radius**: Adjust `border-radius` values

## 📱 Mobile Optimization

Both options are fully responsive:
- **Carousel**: Smaller controls, always visible arrows on mobile
- **Grid**: Stacks vertically on screens under 768px
- **Performance**: Videos are optimized for mobile bandwidth

## 🔧 Troubleshooting

### Video Not Playing:
1. Check file paths are correct
2. Ensure video files are in MP4 format
3. Verify video files are not corrupted
4. Check browser console for errors

### Performance Issues:
1. Compress video files (recommended: 720p, 2-5MB per video)
2. Use shorter video loops (10-30 seconds)
3. Consider using poster images for faster loading

### Adding More Videos:
1. **Carousel**: Add more `<video>` elements and corresponding dots
2. **Grid**: Add more grid items in the HTML structure

## 🎯 Best Practices

### Video Content Ideas:
- **Carousel**: Different angles of your restaurant, food preparation, customer experience
- **Grid**: Main video (restaurant ambiance) + side videos (food close-ups, cooking process)

### File Optimization:
- **Resolution**: 720p or 1080p max
- **Duration**: 10-30 seconds per video
- **Format**: MP4 with H.264 codec
- **Size**: Keep under 5MB per video for web

### Accessibility:
- All videos have `muted` and `playsinline` attributes
- Navigation controls are keyboard accessible
- Screen reader friendly with proper ARIA labels 